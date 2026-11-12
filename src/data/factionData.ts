import { Cluster } from '../types';

export interface CityHeartInfo {
  id: string;
  name: string;
  city: string;
  pointsCost: number;
  weightKg: number;
  marketPrices: Record<Cluster, number>;
  description: string;
}

export const CITY_HEARTS: CityHeartInfo[] = [
  {
    id: 'T1_FACTION_FOREST_TOKEN_1',
    name: 'Treeheart',
    city: 'Lymhurst',
    pointsCost: 3000,
    weightKg: 2.0,
    marketPrices: { west: 32000, europe: 45500, east: 33000 },
    description: 'Surplus forest gatherer token. High export premium in Martlock & Fort Sterling.',
  },
  {
    id: 'T1_FACTION_MOUNTAIN_TOKEN_1',
    name: 'Mountain Heart',
    city: 'Fort Sterling',
    pointsCost: 3000,
    weightKg: 2.0,
    marketPrices: { west: 31500, europe: 46000, east: 34000 },
    description: 'Mountain zerg production. High demand in Bridgewatch & Caerleon.',
  },
  {
    id: 'T1_FACTION_HIGHLAND_TOKEN_1',
    name: 'Rockheart',
    city: 'Martlock',
    pointsCost: 3000,
    weightKg: 2.0,
    marketPrices: { west: 31000, europe: 44000, east: 32000 },
    description: 'Highland quarry token. High markup when shipped to Thetford & Lymhurst.',
  },
  {
    id: 'T1_FACTION_SWAMP_TOKEN_1',
    name: 'Vineheart',
    city: 'Thetford',
    pointsCost: 3000,
    weightKg: 2.0,
    marketPrices: { west: 33000, europe: 45000, east: 33500 },
    description: 'Swamp biome token. Crucial input for Thetford chain-lightning cape crafts.',
  },
  {
    id: 'T1_FACTION_STEPPE_TOKEN_1',
    name: 'Beastheart',
    city: 'Bridgewatch',
    pointsCost: 3000,
    weightKg: 2.0,
    marketPrices: { west: 32500, europe: 46500, east: 33000 },
    description: 'Steppe desert token. Used for Bridgewatch sandstorm capes and saddled beasts.',
  },
  {
    id: 'T1_FACTION_CAERLEON_TOKEN_1',
    name: 'Shadowheart',
    city: 'Caerleon',
    pointsCost: 3000,
    weightKg: 2.0,
    marketPrices: { west: 42000, europe: 48000, east: 39000 },
    description: 'Red zone bandit token. High liquidity and value for Caerleon double-ability capes.',
  },
];

export interface CrestTierInfo {
  tier: number;
  name: string;
  pointsCost: number;
  marketPrices: Record<Cluster, number>;
  baseCapeCost: number;
  heartsReq: number;
  capeSellPrices: Record<Cluster, number>;
  enchantedCapeSellPrices?: Record<Cluster, number>; // .2 enchanted
  enchantCostSilver?: number; // runes + souls
}

export const FACTION_CRESTS: CrestTierInfo[] = [
  {
    tier: 4,
    name: "Adept's Crest (T4)",
    pointsCost: 400,
    marketPrices: { west: 6000, europe: 8500, east: 6200 },
    baseCapeCost: 2000,
    heartsReq: 1,
    capeSellPrices: { west: 56000, europe: 74000, east: 58000 },
    enchantedCapeSellPrices: { west: 78000, europe: 102000, east: 80000 },
    enchantCostSilver: 8400, // 48 T4 Runes + 48 T4 Souls
  },
  {
    tier: 5,
    name: "Expert's Crest (T5)",
    pointsCost: 2250,
    marketPrices: { west: 22000, europe: 32000, east: 24000 },
    baseCapeCost: 6500,
    heartsReq: 1,
    capeSellPrices: { west: 82000, europe: 110000, east: 85000 },
  },
  {
    tier: 6,
    name: "Master's Crest (T6)",
    pointsCost: 3000,
    marketPrices: { west: 38000, europe: 52000, east: 41000 },
    baseCapeCost: 18000,
    heartsReq: 3,
    capeSellPrices: { west: 165000, europe: 225000, east: 172000 },
  },
  {
    tier: 7,
    name: "Grandmaster's Crest (T7)",
    pointsCost: 7500,
    marketPrices: { west: 85000, europe: 115000, east: 90000 },
    baseCapeCost: 48000,
    heartsReq: 5,
    capeSellPrices: { west: 310000, europe: 420000, east: 325000 },
  },
  {
    tier: 8,
    name: "Elder's Crest (T8)",
    pointsCost: 15000,
    marketPrices: { west: 185000, europe: 245000, east: 195000 },
    baseCapeCost: 120000,
    heartsReq: 10,
    capeSellPrices: { west: 680000, europe: 890000, east: 710000 },
  },
];

export interface SmugglerContract {
  id: string;
  name: string;
  type: 'safe' | 'red';
  collateralHearts: number;
  rewardHearts: number;
  netHeartProfit: number;
  cargoWeightKg: number;
  routeZones: string;
  avgTimeMin: number;
  riskDescription: string;
}

export const SMUGGLER_CONTRACTS: SmugglerContract[] = [
  {
    id: 'minor_safe',
    name: 'Minor Transport Contract',
    type: 'safe',
    collateralHearts: 3,
    rewardHearts: 4,
    netHeartProfit: 1,
    cargoWeightKg: 30,
    routeZones: 'Blue / Yellow Zones Only (T4-T5)',
    avgTimeMin: 12,
    riskDescription: '0% full loot loss. Knockout only (10% durability loss, ~1.2k repair). Crate immune to drops.',
  },
  {
    id: 'medium_safe',
    name: 'Medium Transport Contract',
    type: 'safe',
    collateralHearts: 7,
    rewardHearts: 9,
    netHeartProfit: 2,
    cargoWeightKg: 90,
    routeZones: 'Blue / Yellow Zones Only (T4-T5)',
    avgTimeMin: 14,
    riskDescription: '0% full loot loss. Knockout only. Reliable mid-tier safe transport.',
  },
  {
    id: 'major_safe',
    name: 'Major Transport Contract (Safe Zone)',
    type: 'safe',
    collateralHearts: 15,
    rewardHearts: 18,
    netHeartProfit: 3,
    cargoWeightKg: 1650,
    routeZones: '5-7 Safe Zones (Blue/Yellow)',
    avgTimeMin: 16,
    riskDescription: '100% Safe Invariant. Guaranteed +3 Hearts net (~135k silver) per trip. Zero full-loot risk.',
  },
  {
    id: 'major_red',
    name: 'Major Contraband Run (Lethal Red Zone)',
    type: 'red',
    collateralHearts: 15,
    rewardHearts: 27,
    netHeartProfit: 12,
    cargoWeightKg: 1750,
    routeZones: '3-4 Lethal Red Zones',
    avgTimeMin: 9,
    riskDescription: '100% Full Loot PvP Death on dismount/kill! +12 Hearts profit (~530k silver). Requires survival P > 65.25%.',
  },
];

export interface SmugglerMount {
  id: string;
  name: string;
  tier: string;
  baseSpeed: number; // e.g. 40%
  gallopSpeed: number; // e.g. 80%
  carryCapacityKg: number;
  mechanism: 'mount_bound' | 'passive_courier';
  knockoutRisk: string;
  escapeRating: 'F-Tier' | 'C-Tier' | 'B-Tier' | 'A-Tier' | 'S-Tier';
  silverPerMinScore: number;
  tacticalNotes: string;
}

export const SMUGGLER_MOUNTS: SmugglerMount[] = [
  {
    id: 't3_horse',
    name: 'Riding Horse',
    tier: 'T3',
    baseSpeed: 40,
    gallopSpeed: 80,
    carryCapacityKg: 0,
    mechanism: 'passive_courier',
    knockoutRisk: 'Negligible in safe zones',
    escapeRating: 'B-Tier',
    silverPerMinScore: 7800,
    tacticalNotes: 'Does not overload player on dismount. Low cost (7k silver). Good for lightweight minor crates.',
  },
  {
    id: 't4_ox',
    name: 'Transport Ox',
    tier: 'T4 / T5',
    baseSpeed: 30,
    gallopSpeed: 75,
    carryCapacityKg: 1848,
    mechanism: 'mount_bound',
    knockoutRisk: 'Low in Blue/Yellow (Huge HP pool)',
    escapeRating: 'F-Tier',
    silverPerMinScore: 11500,
    tacticalNotes: 'WARNING: Mount-bound weight! Dismounting in Red Zone causes 800% overload death trap. Strictly safe-zone only.',
  },
  {
    id: 't5_armored_horse',
    name: 'Armored Horse',
    tier: 'T5',
    baseSpeed: 40,
    gallopSpeed: 85,
    carryCapacityKg: 0,
    mechanism: 'passive_courier',
    knockoutRisk: 'Negligible (high armor & resilience)',
    escapeRating: 'A-Tier',
    silverPerMinScore: 14200,
    tacticalNotes: 'High defensive stats against random roaming gankers. Fast gate-to-gate gallop.',
  },
  {
    id: 'saddled_wild_boar',
    name: 'Saddled Wild Boar',
    tier: 'T5',
    baseSpeed: 50,
    gallopSpeed: 105,
    carryCapacityKg: 750,
    mechanism: 'passive_courier',
    knockoutRisk: 'Low (Passive weight retains mobility)',
    escapeRating: 'S-Tier',
    silverPerMinScore: 16500,
    tacticalNotes: 'PASSIVE COURIER: Full carry bonus stays active upon dismount! Instant sprint ability. S-tier smuggler mount.',
  },
  {
    id: 'grizzly_bear',
    name: 'Grizzly Bear',
    tier: 'T7',
    baseSpeed: 50,
    gallopSpeed: 85,
    carryCapacityKg: 2126,
    mechanism: 'passive_courier',
    knockoutRisk: 'Extremely Low (Ursine Shield + high HP)',
    escapeRating: 'A-Tier',
    silverPerMinScore: 14000,
    tacticalNotes: 'PASSIVE COURIER: Huge weight capacity. Ursine Shield fears enemies on hit. Ultimate safe-zone freight fortress.',
  },
];

export interface LeechLoadoutItem {
  slot: string;
  item: string;
  tier: string;
  costSilver: number;
  abilityKey: string;
  abilityName: string;
  tacticalRole: string;
}

export const LEECH_LOADOUT: LeechLoadoutItem[] = [
  {
    slot: 'Main Hand (2H)',
    item: 'Double-Bladed Staff',
    tier: '4.0 Normal',
    costSilver: 5500,
    abilityKey: 'Q / W / E',
    abilityName: 'Cartwheel + Stun Run + Soaring Swipe',
    tacticalRole: 'E leaps 15 meters untargeted over cliffs/chokes; W grants +20% movement speed.',
  },
  {
    slot: 'Armor',
    item: 'Assassin Jacket',
    tier: '4.0 Normal',
    costSilver: 3200,
    abilityKey: 'R',
    abilityName: 'Ambush',
    tacticalRole: '8s untargetable invisibility. Drop mob aggro and player target lock immediately.',
  },
  {
    slot: 'Shoes',
    item: 'Miner Boots',
    tier: '4.0 Normal',
    costSilver: 3800,
    abilityKey: 'F',
    abilityName: 'Flee',
    tacticalRole: '+120% movement speed for 5s. Total CC immunity against stuns, roots, and slows.',
  },
  {
    slot: 'Head',
    item: 'Mage Cowl',
    tier: '4.0 Normal',
    costSilver: 2100,
    abilityKey: 'D',
    abilityName: 'Poison',
    tacticalRole: '20-meter range DoT. Tags the Outpost Champion for 100% FP credit with zero combat risk.',
  },
  {
    slot: 'Cape',
    item: 'Regular Cape',
    tier: '3.0 / 4.0 Normal',
    costSilver: 900,
    abilityKey: 'Passive',
    abilityName: 'Energy Regeneration',
    tacticalRole: 'Baseline energy restoration for mobility casts.',
  },
  {
    slot: 'Mount',
    item: 'Riding Horse (or Mule)',
    tier: 'T3 (or T2 Mule)',
    costSilver: 7000,
    abilityKey: 'Passive',
    abilityName: 'Gallop Speed',
    tacticalRole: '40% base / 80% gallop speed. Never causes player overload when dismounted. (Mule costs ~1.2k).',
  },
  {
    slot: 'Potion',
    item: 'Invisibility Potion',
    tier: 'T4.0',
    costSilver: 2400,
    abilityKey: '1',
    abilityName: 'Invisibility Drink',
    tacticalRole: 'Emergency secondary 4.5s stealth layer if revealed or AoE sprayed during Ambush.',
  },
  {
    slot: 'Food',
    item: 'Catfish',
    tier: 'T7.0',
    costSilver: 400,
    abilityKey: 'Passive',
    abilityName: 'Health Regeneration',
    tacticalRole: '+250% out-of-combat health regeneration. Rapid recovery between outpost rushes.',
  },
];

export interface ServerSchedule {
  cluster: Cluster;
  serverName: string;
  maintenanceUtc: string; // e.g. "10:00 UTC"
  maintenanceHourUtc: number; // 10
  maintenanceMinuteUtc: number; // 0
  durationMin: number; // 30-45
  description: string;
}

export const SERVER_SCHEDULES: ServerSchedule[] = [
  {
    cluster: 'west',
    serverName: 'Americas (West)',
    maintenanceUtc: '10:00 UTC',
    maintenanceHourUtc: 10,
    maintenanceMinuteUtc: 0,
    durationMin: 35,
    description: 'Daily restart resets Bandit timer to 2.5h (150m) lockout cooldown automatically.',
  },
  {
    cluster: 'europe',
    serverName: 'Europe (Amsterdam)',
    maintenanceUtc: '10:00 UTC',
    maintenanceHourUtc: 10,
    maintenanceMinuteUtc: 0,
    durationMin: 35,
    description: 'Daily restart at 10:00 UTC. Post-maintenance invariant applies: 0% rolls for 150m.',
  },
  {
    cluster: 'east',
    serverName: 'Asia (Singapore)',
    maintenanceUtc: '22:00 UTC',
    maintenanceHourUtc: 22,
    maintenanceMinuteUtc: 0,
    durationMin: 35,
    description: 'Daily restart at 22:00 UTC. Lockout timer resets to 2.5h before first hazard roll.',
  },
];

/**
 * Computes Weibull Cumulative Probability F(t) for Bandit Assault trigger
 * @param elapsedMinutes Time in minutes since previous Bandit ended
 * @returns probability between 0.0 and 1.0 (0% to 100%)
 */
export function calculateWeibullProbability(elapsedMinutes: number): number {
  const LOCKOUT_MINUTES = 150; // 2.5 hours
  const LAMBDA_SCALE = 105; // Characteristic roll duration
  const K_SHAPE = 2.4; // Steepening hazard rate

  if (elapsedMinutes < LOCKOUT_MINUTES) {
    return 0.0;
  }

  const deltaT = elapsedMinutes - LOCKOUT_MINUTES;
  const exponent = Math.pow(deltaT / LAMBDA_SCALE, K_SHAPE);
  const prob = 1.0 - Math.exp(-exponent);

  // Clamp to [0, 0.999]
  return Math.min(Math.max(prob, 0.0), 0.999);
}

export type BanditState =
  | 'LOCKED_COOLDOWN'
  | 'ROLLING'
  | 'HIGH_PROBABILITY'
  | 'IMMINENT'
  | '15M_WARNING'
  | 'ACTIVE';

export function getBanditState(
  elapsedMinutes: number,
  is15mWarningActive: boolean,
  isBanditActive: boolean
): BanditState {
  if (isBanditActive) return 'ACTIVE';
  if (is15mWarningActive) return '15M_WARNING';
  if (elapsedMinutes < 150) return 'LOCKED_COOLDOWN';
  if (elapsedMinutes < 240) return 'ROLLING';
  if (elapsedMinutes < 300) return 'HIGH_PROBABILITY';
  return 'IMMINENT';
}
