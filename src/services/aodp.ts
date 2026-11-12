import { AODPPriceRecord, ArbitrageOpportunity, Cluster, FilterState, AlbionItem } from '../types';

const CLUSTER_URLS: Record<Cluster, string> = {
  west: 'https://west.albion-online-data.com',
  europe: 'https://europe.albion-online-data.com',
  east: 'https://east.albion-online-data.com',
};

const ROYAL_CITIES = ['Martlock', 'Thetford', 'Fort Sterling', 'Lymhurst', 'Bridgewatch'];
const TARGET_DESTINATIONS = ['Caerleon', 'Black Market'];

// Cache to prevent rapid repeated calls
const cache = new Map<string, { data: AODPPriceRecord[]; timestamp: number }>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute local memory cache

export async function fetchGoldPrice(cluster: Cluster): Promise<number> {
  const baseUrl = CLUSTER_URLS[cluster];
  try {
    const res = await fetch(`${baseUrl}/api/v2/stats/gold.json?count=1`, {
      headers: {
        'Accept': 'application/json',
      }
    });
    if (!res.ok) return 0;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data[0].price || 0;
    }
  } catch (err) {
    console.warn('Failed to fetch gold price:', err);
  }
  return 0;
}

export async function fetchGoldHistory(cluster: Cluster, count = 30): Promise<{ price: number; timestamp: string }[]> {
  const baseUrl = CLUSTER_URLS[cluster];
  try {
    const res = await fetch(`${baseUrl}/api/v2/stats/gold.json?count=${count}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) {
      return data.map((d) => ({ price: d.price || 0, timestamp: d.timestamp || '' }));
    }
  } catch (err) {
    console.warn('Failed to fetch gold history:', err);
  }
  return [];
}

export function formatPriceAge(isoDateString: string): { label: string; ageHours: number } {
  if (!isoDateString || typeof isoDateString !== 'string' || isoDateString.startsWith('0001-01-01')) {
    return { label: 'Unknown', ageHours: 9999 };
  }
  
  // Normalize date string: append 'Z' only if no timezone indicator is present
  const hasTimezone =
    isoDateString.endsWith('Z') ||
    (isoDateString.includes('T') &&
      (isoDateString.slice(10).includes('+') || isoDateString.slice(10).includes('-')));
  const normalized = hasTimezone ? isoDateString : `${isoDateString}Z`;
  const priceDate = new Date(normalized).getTime();

  if (isNaN(priceDate)) {
    return { label: 'Unknown', ageHours: 9999 };
  }

  const now = Date.now();
  const diffMs = Math.max(0, now - priceDate);
  const diffMin = Math.floor(diffMs / (60 * 1000));
  const diffHours = diffMin / 60;

  if (diffMin < 60) {
    return { label: `${diffMin}m ago`, ageHours: diffHours };
  } else if (diffHours < 24) {
    return { label: `${Math.floor(diffHours)}h ago`, ageHours: diffHours };
  } else {
    return { label: `${Math.floor(diffHours / 24)}d ago`, ageHours: diffHours };
  }
}

/**
 * Fetch prices for a list of raw item IDs in chunks
 */
export async function fetchPricesBatch(
  cluster: Cluster,
  itemRawIds: string[],
  locations: string[] = [...ROYAL_CITIES, ...TARGET_DESTINATIONS],
  signal?: AbortSignal
): Promise<AODPPriceRecord[]> {
  const baseUrl = CLUSTER_URLS[cluster];
  const chunkSize = 25; // Keep URLs compact and fast
  const allRecords: AODPPriceRecord[] = [];

  const locationsParam = locations.join(',');

  for (let i = 0; i < itemRawIds.length; i += chunkSize) {
    if (signal?.aborted) break;

    const chunk = itemRawIds.slice(i, i + chunkSize);
    const itemsParam = chunk.join(',');
    const cacheKey = `${cluster}_${itemsParam}_${locationsParam}`;

    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      allRecords.push(...cached.data);
      continue;
    }

    const url = `${baseUrl}/api/v2/stats/prices/${itemsParam}.json?locations=${locationsParam}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
        signal,
      });

      if (!response.ok) {
        console.warn(`AODP query returned status: ${response.status}`);
        if (response.status === 429) {
          // Back off briefly if rate limited
          await new Promise((res) => setTimeout(res, 1000));
        }
        continue;
      }

      const data: AODPPriceRecord[] = await response.json();
      if (Array.isArray(data)) {
        allRecords.push(...data);
        cache.set(cacheKey, { data, timestamp: Date.now() });
      }
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        break;
      }
      console.error(`Error fetching chunk ${i / chunkSize}:`, err);
    }
  }

  return allRecords;
}

/**
 * Calculates all profitable arbitrage spreads and Black Market starvation items
 */
export function computeArbitrage(
  items: AlbionItem[],
  records: AODPPriceRecord[],
  filters: FilterState
): ArbitrageOpportunity[] {
  const opportunities: ArbitrageOpportunity[] = [];

  // Index prices by: itemId_quality -> Map of city -> PriceRecord
  const priceIndex = new Map<string, Map<string, AODPPriceRecord>>();

  for (const record of records) {
    const key = `${record.item_id}_${record.quality}`;
    if (!priceIndex.has(key)) {
      priceIndex.set(key, new Map());
    }
    priceIndex.get(key)!.set(record.city, record);
  }

  const taxRate = filters.hasPremium ? 0.04 : 0.08;

  for (const item of items) {
    for (let quality = 1; quality <= 5; quality++) {
      const key = `${item.rawId}_${quality}`;
      const cityMap = priceIndex.get(key);
      if (!cityMap) continue;

      // Prioritize destination with highest buy order > 0 (Black Market or Caerleon)
      const bm = cityMap.get('Black Market');
      const cl = cityMap.get('Caerleon');
      let destRecord: AODPPriceRecord | undefined;

      if (bm && bm.buy_price_max > 0 && cl && cl.buy_price_max > 0) {
        destRecord = bm.buy_price_max >= cl.buy_price_max ? bm : cl;
      } else if (bm && bm.buy_price_max > 0) {
        destRecord = bm;
      } else if (cl && cl.buy_price_max > 0) {
        destRecord = cl;
      }

      if (!destRecord) continue;

      // Destination buy price (Max buy order)
      const destSellPrice = destRecord.buy_price_max;
      if (destSellPrice <= 0) continue;

      const destAge = formatPriceAge(destRecord.buy_price_max_date);
      if (destAge.ageHours > filters.maxAgeHours) continue;

      // Find lowest sell order across Royal cities
      for (const royalCity of ROYAL_CITIES) {
        if (filters.sourceCity !== 'all' && filters.sourceCity !== royalCity) {
          continue;
        }

        const royalRecord = cityMap.get(royalCity);
        if (!royalRecord) continue;

        const sourceBuyPrice = royalRecord.sell_price_min;
        if (sourceBuyPrice <= 0) continue;

        const sourceAge = formatPriceAge(royalRecord.sell_price_min_date);
        if (sourceAge.ageHours > filters.maxAgeHours) continue;

        // Profit calculations
        const grossProfit = destSellPrice - sourceBuyPrice;
        if (grossProfit <= 0) continue;

        const taxesAndFees = Math.round(destSellPrice * taxRate);
        const netProfit = grossProfit - taxesAndFees;
        if (netProfit <= 0 || netProfit < filters.minProfit) continue;

        const roiPercentage = Math.round((netProfit / sourceBuyPrice) * 100);
        if (roiPercentage < filters.minRoi) continue;

        const isStarvation = roiPercentage >= 150 && destSellPrice >= 50000;
        if (filters.starvationOnly && !isStarvation) continue;

        opportunities.push({
          item,
          quality,
          sourceCity: royalCity,
          sourceBuyPrice,
          sourcePriceAge: sourceAge.label,
          destCity: (destRecord.city === 'Black Market' ? 'Black Market' : 'Caerleon'),
          destSellPrice,
          destPriceAge: destAge.label,
          grossProfit,
          taxesAndFees,
          netProfit,
          roiPercentage,
          isStarvation,
        });
      }
    }
  }

  // Sort descending by Net Profit
  return opportunities.sort((a, b) => b.netProfit - a.netProfit);
}
