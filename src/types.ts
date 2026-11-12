export type Cluster = 'west' | 'europe' | 'east';

export type RoyalCity = 'Fort Sterling' | 'Thetford' | 'Lymhurst' | 'Bridgewatch' | 'Martlock';

export type DestinationCity = 'Caerleon' | 'Black Market';

export type ItemCategory = 
  | 'all'
  | 'weapons_melee'
  | 'weapons_ranged'
  | 'weapons_magic'
  | 'armor_cloth'
  | 'armor_leather'
  | 'armor_plate'
  | 'bags_capes'
  | 'accessories';

export interface AlbionItem {
  id: string; // e.g. T6_MAIN_SWORD
  name: string; // e.g. Broadsword
  tier: number; // 4 to 8
  enchantment: number; // 0 to 3
  category: ItemCategory;
  rawId: string; // Full formatted ID for API, e.g. T6_MAIN_SWORD@2
}

export interface AODPPriceRecord {
  item_id: string;
  city: string;
  quality: number;
  sell_price_min: number;
  sell_price_min_date: string;
  sell_price_max: number;
  sell_price_max_date: string;
  buy_price_min: number;
  buy_price_min_date: string;
  buy_price_max: number;
  buy_price_max_date: string;
}

export interface ArbitrageOpportunity {
  item: AlbionItem;
  quality: number;
  sourceCity: string;
  sourceBuyPrice: number; // Lowest sell order in source city
  sourcePriceAge: string;
  destCity: DestinationCity;
  destSellPrice: number; // Highest buy order in Black Market / Caerleon
  destPriceAge: string;
  grossProfit: number;
  taxesAndFees: number;
  netProfit: number;
  roiPercentage: number;
  isStarvation: boolean; // True if ROI >= 150% and buy order is active
}

export interface FilterState {
  search: string;
  category: ItemCategory;
  tiers: number[];
  enchantments: number[];
  sourceCity: string; // 'all' or specific city
  minProfit: number;
  minRoi: number;
  hasPremium: boolean;
  maxAgeHours: number;
  starvationOnly: boolean;
}
