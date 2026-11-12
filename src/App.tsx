import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Cluster, FilterState, AODPPriceRecord, NavigationTab, ManifestItem, ArbitrageOpportunity } from './types';
import { ALBION_CATALOG } from './data/items';
import { fetchGoldPrice, fetchPricesBatch, computeArbitrage } from './services/aodp';
import { playAlertChime } from './utils/audio';
import { Navbar } from './components/Navbar';
import { StatsBanner } from './components/StatsBanner';
import { FilterBar } from './components/FilterBar';
import { ArbitrageCard } from './components/ArbitrageCard';
import { FactionMatrixModal } from './components/FactionMatrixModal';
import { TransportManifestDrawer } from './components/TransportManifestDrawer';
import { RefiningLab } from './components/RefiningLab';
import { GoldMacroOracle } from './components/GoldMacroOracle';
import { RerollSimulator } from './components/RerollSimulator';
import { Sparkles, AlertCircle, RefreshCw, Check } from 'lucide-react';

export const App: React.FC = () => {
  const [cluster, setCluster] = useState<Cluster>('west');
  const [goldPrice, setGoldPrice] = useState<number>(0);
  const [hasPremium, setHasPremium] = useState<boolean>(true);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<NavigationTab>('black_market');

  const [isFactionModalOpen, setIsFactionModalOpen] = useState<boolean>(false);
  const [isManifestOpen, setIsManifestOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Transport Run Manifest Cart with LocalStorage persistence
  const [manifestItems, setManifestItems] = useState<ManifestItem[]>(() => {
    try {
      const saved = localStorage.getItem('albion_wizard_manifest');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('albion_wizard_manifest', JSON.stringify(manifestItems));
    } catch (e) {
      console.warn('Failed to save manifest to localStorage:', e);
    }
  }, [manifestItems]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [rawPrices, setRawPrices] = useState<AODPPriceRecord[]>([]);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    tiers: [4, 5, 6, 7, 8],
    enchantments: [0, 1, 2, 3],
    sourceCity: 'all',
    minProfit: 25000,
    minRoi: 25,
    hasPremium: true,
    maxAgeHours: 24,
    starvationOnly: false,
  });

  // Toast notification helper
  const handleCardCopied = useCallback((itemName: string) => {
    setToastMessage(itemName);
    setTimeout(() => {
      setToastMessage((prev) => (prev === itemName ? null : prev));
    }, 2500);
  }, []);

  // Manifest Cart Handlers
  const handleAddToManifest = useCallback((opp: ArbitrageOpportunity) => {
    setManifestItems((prev) => {
      const existing = prev.find(
        (i) =>
          i.opp.item.rawId === opp.item.rawId &&
          i.opp.quality === opp.quality &&
          i.opp.sourceCity === opp.sourceCity
      );
      if (existing) {
        return prev.map((i) =>
          i.opp.item.rawId === opp.item.rawId &&
          i.opp.quality === opp.quality &&
          i.opp.sourceCity === opp.sourceCity
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { opp, quantity: 1 }];
    });
    setToastMessage(`Added "${opp.item.name}" to Transport Run`);
    setTimeout(() => setToastMessage(null), 2000);
  }, []);

  const handleUpdateQuantity = useCallback(
    (rawId: string, quality: number, city: string, delta: number) => {
      setManifestItems((prev) =>
        prev
          .map((i) => {
            if (i.opp.item.rawId === rawId && i.opp.quality === quality && i.opp.sourceCity === city) {
              const newQty = i.quantity + delta;
              return newQty > 0 ? { ...i, quantity: newQty } : null;
            }
            return i;
          })
          .filter(Boolean) as ManifestItem[]
      );
    },
    []
  );

  const handleRemoveManifestItem = useCallback((rawId: string, quality: number, city: string) => {
    setManifestItems((prev) =>
      prev.filter(
        (i) => !(i.opp.item.rawId === rawId && i.opp.quality === quality && i.opp.sourceCity === city)
      )
    );
  }, []);

  const handleClearManifest = useCallback(() => {
    setManifestItems([]);
  }, []);

  // Sync premium filter with top navbar premium toggle
  useEffect(() => {
    setFilters((prev) => ({ ...prev, hasPremium }));
  }, [hasPremium]);

  // Main scan function
  const scanMarket = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    try {
      // 1. Fetch Gold price
      fetchGoldPrice(cluster, signal).then((price) => {
        if (!signal?.aborted && price > 0) setGoldPrice(price);
      });

      // 2. Fetch prices for catalog
      const rawIds = ALBION_CATALOG.map((item) => item.rawId);
      const records = await fetchPricesBatch(cluster, rawIds, undefined, signal);

      if (signal?.aborted) return;

      setRawPrices(records);
      setLastUpdated(new Date());

      // 3. Check for high-ROI opportunities and trigger audio alert
      const currentOpps = computeArbitrage(ALBION_CATALOG, records, filters);
      const hasStarvation = currentOpps.some((o) => o.isStarvation);

      if (hasStarvation && audioEnabled) {
        playAlertChime();
      }
    } catch (err: unknown) {
      if ((err as Error)?.name !== 'AbortError') {
        console.error('Scan failed:', err);
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [cluster, filters, audioEnabled]);

  // Initial scan on mount and whenever cluster changes with cancellation guard
  useEffect(() => {
    const controller = new AbortController();
    scanMarket(controller.signal);
    return () => {
      controller.abort();
    };
  }, [cluster]);

  // Filter catalog based on active search, category, tiers, and enchantments
  const filteredCatalog = useMemo(() => {
    return ALBION_CATALOG.filter((item) => {
      if (filters.category !== 'all' && item.category !== filters.category) {
        return false;
      }
      if (!filters.tiers.includes(item.tier)) {
        return false;
      }
      if (!filters.enchantments.includes(item.enchantment)) {
        return false;
      }
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesId = item.rawId.toLowerCase().includes(query);
        if (!matchesName && !matchesId) return false;
      }
      return true;
    });
  }, [filters.category, filters.tiers, filters.enchantments, filters.search]);

  // Compute final filtered arbitrage opportunities
  const opportunities = useMemo(() => {
    return computeArbitrage(filteredCatalog, rawPrices, filters);
  }, [filteredCatalog, rawPrices, filters]);

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col font-sans overflow-x-hidden w-full">
      {/* Top Navigation */}
      <Navbar
        cluster={cluster}
        onClusterChange={(c) => setCluster(c)}
        goldPrice={goldPrice}
        hasPremium={hasPremium}
        onPremiumToggle={() => setHasPremium(!hasPremium)}
        audioEnabled={audioEnabled}
        onAudioToggle={() => setAudioEnabled(!audioEnabled)}
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'faction_matrix') {
            setIsFactionModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        manifestCount={manifestItems.reduce((acc, i) => acc + i.quantity, 0)}
        onOpenManifest={() => setIsManifestOpen(true)}
      />

      {/* Main Suite Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 overflow-x-hidden min-w-0 max-w-full">
        {/* TAB 1: Black Market Predator (System 2 & 5) */}
        {activeTab === 'black_market' && (
          <>
            {/* Statistics Dashboard Banner */}
            <StatsBanner
              opportunities={opportunities}
              isLoading={isLoading}
              onRefresh={() => scanMarket()}
              lastUpdated={lastUpdated}
              totalCatalogCount={ALBION_CATALOG.length}
            />

            {/* Filter & Search Bar */}
            <FilterBar filters={filters} onChange={setFilters} />

            {/* Arbitrage Opportunities Grid */}
            <section className="space-y-3 sm:space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>Profitable Arbitrage Spreads ({opportunities.length})</span>
                </h2>
                <span className="text-xs text-slate-500 font-mono truncate">
                  Click card to copy name &bull; Click "Add Run" to build transport haul
                </span>
              </div>

              {isLoading && opportunities.length === 0 ? (
                <div className="bg-[#121826] border border-slate-800 rounded-2xl p-8 sm:p-12 text-center space-y-3">
                  <RefreshCw className="h-8 w-8 text-amber-400 animate-spin mx-auto" />
                  <p className="text-slate-300 font-medium text-sm">
                    Scanning regional order books on {cluster.toUpperCase()} cluster...
                  </p>
                  <p className="text-xs text-slate-500">
                    Fetching live market orders from Albion Online Data Project (AODP)...
                  </p>
                </div>
              ) : opportunities.length === 0 ? (
                <div className="bg-[#121826] border border-slate-800 rounded-2xl p-8 sm:p-12 text-center space-y-3">
                  <AlertCircle className="h-8 w-8 text-slate-500 mx-auto" />
                  <h3 className="text-slate-300 font-semibold text-base">
                    No matching opportunities found with current filters
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Try widening your filters (e.g. decrease Min Profit, lower Min ROI, or increase Max Age to 24 Hours) to discover active market spreads.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0 max-w-full">
                  {opportunities.map((opp, idx) => (
                    <ArbitrageCard
                      key={`${opp.item.rawId}_${opp.quality}_${opp.sourceCity}_${idx}`}
                      opp={opp}
                      onCopied={handleCardCopied}
                      onAddToManifest={handleAddToManifest}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* TAB 3: 700/700 Focus & Refining Lab (System 3 & 4) */}
        {activeTab === 'refining_lab' && <RefiningLab />}

        {/* TAB 4: +EV Quality Reroll Simulator (System 5) */}
        {activeTab === 'reroll_sim' && <RerollSimulator hasPremium={hasPremium} />}

        {/* TAB 5: Gold Macro & Patch Front-Running Oracle (System 6 & 7) */}
        {activeTab === 'macro_oracle' && <GoldMacroOracle cluster={cluster} goldPrice={goldPrice} />}
      </main>

      {/* System 1: Faction Matrix Modal */}
      <FactionMatrixModal
        isOpen={isFactionModalOpen}
        onClose={() => setIsFactionModalOpen(false)}
      />

      {/* System 2: Transport Run Manifest Drawer */}
      <TransportManifestDrawer
        isOpen={isManifestOpen}
        onClose={() => setIsManifestOpen(false)}
        items={manifestItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveManifestItem}
        onClearAll={handleClearManifest}
      />

      {/* Floating Clipboard / Action Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900/95 border border-amber-500/50 shadow-2xl shadow-amber-500/20 text-xs text-white backdrop-blur animate-in fade-in slide-in-from-bottom-3 duration-200 max-w-[90vw] truncate">
          <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0e131f] px-3 sm:px-4 py-5 sm:py-6 mt-8 sm:mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 text-center md:text-left">
          <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
            <span className="font-mono font-bold text-slate-300">Albion Wizard</span>
            <span>&bull;</span>
            <span>Systems 1 through 7 Online</span>
            <span>&bull;</span>
            <span className="text-emerald-400">100% EAC & ToS Safe</span>
          </div>
          <div>
            Powered by live market telemetry from the <a href="https://www.albion-online-data.com" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">Albion Online Data Project (AODP)</a>.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
