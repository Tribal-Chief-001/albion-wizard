import { ResourceBiome, RoyalCity } from '../types';

export interface BiomeBonusInfo {
  biome: ResourceBiome;
  rawName: string;
  refinedName: string;
  bonusCity: RoyalCity;
  rawItemId: (tier: number, ench: number) => string;
  refinedItemId: (tier: number, ench: number) => string;
}

export const BIOME_CONFIGS: Record<ResourceBiome, BiomeBonusInfo> = {
  Wood: {
    biome: 'Wood',
    rawName: 'Wood',
    refinedName: 'Planks',
    bonusCity: 'Lymhurst',
    rawItemId: (t, e) => (e > 0 ? `T${t}_WOOD@${e}` : `T${t}_WOOD`),
    refinedItemId: (t, e) => (e > 0 ? `T${t}_PLANKS@${e}` : `T${t}_PLANKS`),
  },
  Ore: {
    biome: 'Ore',
    rawName: 'Ore',
    refinedName: 'Metal Bars',
    bonusCity: 'Fort Sterling',
    rawItemId: (t, e) => (e > 0 ? `T${t}_ORE@${e}` : `T${t}_ORE`),
    refinedItemId: (t, e) => (e > 0 ? `T${t}_METALBAR@${e}` : `T${t}_METALBAR`),
  },
  Fiber: {
    biome: 'Fiber',
    rawName: 'Fiber',
    refinedName: 'Cloth',
    bonusCity: 'Bridgewatch',
    rawItemId: (t, e) => (e > 0 ? `T${t}_FIBER@${e}` : `T${t}_FIBER`),
    refinedItemId: (t, e) => (e > 0 ? `T${t}_CLOTH@${e}` : `T${t}_CLOTH`),
  },
  Hide: {
    biome: 'Hide',
    rawName: 'Hide',
    refinedName: 'Leather',
    bonusCity: 'Thetford',
    rawItemId: (t, e) => (e > 0 ? `T${t}_HIDE@${e}` : `T${t}_HIDE`),
    refinedItemId: (t, e) => (e > 0 ? `T${t}_LEATHER@${e}` : `T${t}_LEATHER`),
  },
  Stone: {
    biome: 'Stone',
    rawName: 'Stone',
    refinedName: 'Stone Blocks',
    bonusCity: 'Martlock',
    rawItemId: (t, e) => (e > 0 ? `T${t}_ROCK@${e}` : `T${t}_ROCK`),
    refinedItemId: (t, e) => (e > 0 ? `T${t}_STONEBLOCK@${e}` : `T${t}_STONEBLOCK`),
  },
};

/**
 * Base focus cost per tier for refining (at 0 spec)
 */
export const BASE_REFINING_FOCUS: Record<number, number> = {
  4: 54,
  5: 110,
  6: 228,
  7: 462,
  8: 940,
};

/**
 * Material consumption ratios per tier:
 * T4: 2 Raw T4 + 1 Refined T3
 * T5: 3 Raw T5 + 1 Refined T4
 * T6: 4 Raw T6 + 1 Refined T5
 * T7: 5 Raw T7 + 1 Refined T6
 * T8: 5 Raw T8 + 1 Refined T7
 */
export const RAW_REQUIRED_PER_CRAFT: Record<number, number> = {
  4: 2,
  5: 3,
  6: 4,
  7: 5,
  8: 5,
};

/**
 * Hardcoded NPC Transmutation Silver fees
 * Upgrading flat Tier N to Tier N+1
 */
export const NPC_TIER_TRANSMUTE_COSTS: Record<string, number> = {
  '4->5': 1500,
  '5->6': 5250,
  '6->7': 18000,
  '7->8': 65000,
};

/**
 * Hardcoded NPC Transmutation Silver fees
 * Upgrading enchantment level .0 -> .1 -> .2 -> .3
 */
export const NPC_ENCHANT_TRANSMUTE_COSTS: Record<number, Record<string, number>> = {
  4: { '0->1': 110, '1->2': 330, '2->3': 990 },
  5: { '0->1': 450, '1->2': 1350, '2->3': 4050 },
  6: { '0->1': 1800, '1->2': 5400, '2->3': 16200 },
  7: { '0->1': 7200, '1->2': 21600, '2->3': 64800 },
  8: { '0->1': 28800, '1->2': 86400, '2->3': 259200 },
};

/**
 * Computes exact Resource Return Rate (RRR)
 */
export function calculateRRR(inBonusCity: boolean, withFocus: boolean, hasDailyEvent: boolean): number {
  if (withFocus) {
    if (inBonusCity) return hasDailyEvent ? 0.579 : 0.539; // 53.9% or 57.9% with event
    return 0.435; // non-bonus city + focus
  } else {
    if (inBonusCity) return hasDailyEvent ? 0.435 : 0.367; // 36.7% or 43.5%
    return 0.152; // 15.2% base
  }
}

/**
 * Computes actual Focus cost per refined unit based on specialization
 * Total Efficiency = (MasterySpec * 300) + (TierSpec * 2500)
 * Max efficiency ~ 10,000 gives 0.5^(10000/10000) = 50% discount per efficiency tier (approx 88% total discount)
 */
export function calculateFocusCost(baseTier: number, masterySpec: number, tierSpec: number): number {
  const baseCost = BASE_REFINING_FOCUS[baseTier] || 100;
  const totalEfficiency = (masterySpec * 30) + (tierSpec * 250);
  const cost = Math.max(1, Math.round(baseCost * Math.pow(0.5, totalEfficiency / 10000)));
  return cost;
}
