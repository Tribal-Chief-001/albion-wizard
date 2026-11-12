import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  Dices,
  Coins,
  Sparkles,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Play,
  Square,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  BarChart3,
  Sliders,
  Zap,
  ChevronDown,
  ChevronUp,
  Percent,
  Target,
  Flame,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { QUALITY_NAMES, QUALITY_COLORS, TIER_COLORS, formatSilver } from '../utils/quality';
import { playAlertChime } from '../utils/audio';

export interface RerollSimulatorProps {
  initialTier?: number;
  initialEnchantment?: number;
  hasPremium?: boolean;
}

// Preset candidate configs based on high-frequency Black Market Masterpiece buy orders
interface ItemPreset {
  name: string;
  tier: number;
  enchantment: number;
  purchaseCost: number;
  bmBuyOrderPrice: number;
  description: string;
}

const PRESETS: ItemPreset[] = [
  {
    name: 'T6.1 Carving Sword',
    tier: 6,
    enchantment: 1,
    purchaseCost: 95_000,
    bmBuyOrderPrice: 3_850_000,
    description: 'High BM turnover melee weapon with steep MP premium',
  },
  {
    name: 'T7.1 Stalker Jacket',
    tier: 7,
    enchantment: 1,
    purchaseCost: 145_000,
    bmBuyOrderPrice: 5_200_000,
    description: 'Meta leather armor with massive Black Market demand',
  },
  {
    name: 'T8.0 Broadsword',
    tier: 8,
    enchantment: 0,
    purchaseCost: 115_000,
    bmBuyOrderPrice: 4_600_000,
    description: 'Flat T8 high-tier base with low roll fee ratio',
  },
  {
    name: 'T6.2 Bloodletter',
    tier: 6,
    enchantment: 2,
    purchaseCost: 290_000,
    bmBuyOrderPrice: 8_100_000,
    description: 'Enchanted escape dagger with multi-million MP spread',
  },
  {
    name: 'T5.2 Bow of Badon',
    tier: 5,
    enchantment: 2,
    purchaseCost: 175_000,
    bmBuyOrderPrice: 4_950_000,
    description: 'Mid-tier enchanted artifact bow with strong BM scaling',
  },
  {
    name: 'T7.2 Galatine Pair',
    tier: 7,
    enchantment: 2,
    purchaseCost: 680_000,
    bmBuyOrderPrice: 15_200_000,
    description: 'High-risk, ultra-high-reward ZvZ artifact jackpot',
  },
];

// Albion Online Repair Station mechanics reference values:
// Reroll Fee = Base Item Value * Tier Multiplier * Enchantment Multiplier
// Approx 2k-15k per roll for T5-T7 enchanted items.
const DEFAULT_BASE_ITEM_VALUES: Record<number, number> = {
  4: 400,
  5: 800,
  6: 1600,
  7: 3200,
  8: 6400,
};

const TIER_FEE_MULTIPLIERS: Record<number, number> = {
  4: 1.5,
  5: 2.0,
  6: 2.5,
  7: 3.0,
  8: 3.8,
};

const ENCHANT_MULTIPLIERS: Record<number, number> = {
  0: 1.0,
  1: 1.8,
  2: 3.2,
  3: 5.5,
};

/**
 * Monte Carlo Simulation result metrics
 */
interface SimulationStats {
  totalRuns: number;
  avgRolls: number;
  medianRolls: number;
  p90Rolls: number;
  p99Rolls: number;
  minRolls: number;
  maxRolls: number;
  avgCost: number;
  medianCost: number;
  p90Cost: number;
  winRate: number; // percentage of runs that were profitable
  avgProfit: number;
  totalSimulatedProfit: number;
  distributionBuckets: { range: string; count: number; percentage: number }[];
}

export const RerollSimulator: React.FC<RerollSimulatorProps> = ({
  initialTier = 6,
  initialEnchantment = 1,
  hasPremium: initialHasPremium = true,
}) => {
  // Main Calculator Inputs
  const [tier, setTier] = useState<number>(initialTier);
  const [enchantment, setEnchantment] = useState<number>(initialEnchantment);
  const [startingQuality, setStartingQuality] = useState<number>(2); // 1: Normal, 2: Good, 3: Outstanding, 4: Excellent
  const [purchaseCost, setPurchaseCost] = useState<number>(95_000);
  const [bmBuyOrderPrice, setBmBuyOrderPrice] = useState<number>(3_850_000);
  const [simulatedRuns, setSimulatedRuns] = useState<number>(1000);
  const [hasPremium, setHasPremium] = useState<boolean>(initialHasPremium);
  const [taxMode, setTaxMode] = useState<'direct_fill' | 'sell_order'>('direct_fill');

  // Custom Fee Override
  const [isCustomFee, setIsCustomFee] = useState<boolean>(false);
  const [customFeeInput, setCustomFeeInput] = useState<number>(7_200);

  // Advanced Probability Configuration
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [probNormalToGood, setProbNormalToGood] = useState<number>(0.5); // ~50%
  const [probGoodToOutstanding, setProbGoodToOutstanding] = useState<number>(0.25); // ~25%
  const [probOutstandingToExcellent, setProbOutstandingToExcellent] = useState<number>(0.05); // ~5%
  const [probExcellentToMasterpiece, setProbExcellentToMasterpiece] = useState<number>(0.0015); // ~0.15%

  // Sound effects toggle
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Interactive Live Forge Bench State
  const [benchQuality, setBenchQuality] = useState<number>(startingQuality);
  const [benchRolls, setBenchRolls] = useState<number>(0);
  const [benchSpentSilver, setBenchSpentSilver] = useState<number>(0);
  const [benchIsAutoRolling, setBenchIsAutoRolling] = useState<boolean>(false);
  const autoRollIntervalRef = useRef<number | null>(null);

  // Sync bench starting quality when user changes startingQuality
  useEffect(() => {
    setBenchQuality(startingQuality);
    setBenchRolls(0);
    setBenchSpentSilver(0);
  }, [startingQuality]);

  // Repair Station Reroll Cost calculation
  const autoRerollFee = useMemo(() => {
    const baseValue = DEFAULT_BASE_ITEM_VALUES[tier] ?? 1600;
    const tierMult = TIER_FEE_MULTIPLIERS[tier] ?? 2.5;
    const enchMult = ENCHANT_MULTIPLIERS[enchantment] ?? 1.8;
    return Math.round(baseValue * tierMult * enchMult);
  }, [tier, enchantment]);

  const activeRerollFee = isCustomFee ? Math.max(1, customFeeInput) : autoRerollFee;

  // Tax calculations
  // Direct BM Order Fill: 4% with Premium, 8% without.
  // BM Sell Order: 4% + 2.5% setup fee = 6.5% with Premium; 8% + 2.5% = 10.5% without.
  const effectiveTaxRate = useMemo(() => {
    if (taxMode === 'direct_fill') {
      return hasPremium ? 0.04 : 0.08;
    }
    return hasPremium ? 0.065 : 0.105;
  }, [taxMode, hasPremium]);

  const netRevenue = useMemo(() => {
    return Math.round(bmBuyOrderPrice * (1 - effectiveTaxRate));
  }, [bmBuyOrderPrice, effectiveTaxRate]);

  // Expected rolls via Geometric / Step Distribution
  // Quality progression:
  // Step 1: Normal (1) -> Good (2): E[rolls] = 1 / probNormalToGood
  // Step 2: Good (2) -> Outstanding (3): E[rolls] = 1 / probGoodToOutstanding
  // Step 3: Outstanding (3) -> Excellent (4): E[rolls] = 1 / probOutstandingToExcellent
  // Step 4: Excellent (4) -> Masterpiece (5): E[rolls] = 1 / probExcellentToMasterpiece
  const expectedRolls = useMemo(() => {
    let rolls = 0;
    if (startingQuality <= 1) rolls += 1 / probNormalToGood;
    if (startingQuality <= 2) rolls += 1 / probGoodToOutstanding;
    if (startingQuality <= 3) rolls += 1 / probOutstandingToExcellent;
    if (startingQuality <= 4) rolls += 1 / probExcellentToMasterpiece;
    return rolls;
  }, [
    startingQuality,
    probNormalToGood,
    probGoodToOutstanding,
    probOutstandingToExcellent,
    probExcellentToMasterpiece,
  ]);

  // Expected Silver cost & EV outputs
  const expectedRerollCost = useMemo(() => {
    return Math.round(expectedRolls * activeRerollFee);
  }, [expectedRolls, activeRerollFee]);

  const expectedTotalCost = useMemo(() => {
    return purchaseCost + expectedRerollCost;
  }, [purchaseCost, expectedRerollCost]);

  const expectedNetValue = useMemo(() => {
    return netRevenue - expectedTotalCost;
  }, [netRevenue, expectedTotalCost]);

  const expectedRoi = useMemo(() => {
    return expectedTotalCost > 0 ? (expectedNetValue / expectedTotalCost) * 100 : 0;
  }, [expectedNetValue, expectedTotalCost]);

  const isPositiveEV = expectedNetValue > 0;

  // Break-Even Metrics
  const breakEvenSellPrice = useMemo(() => {
    const divisor = 1 - effectiveTaxRate;
    return divisor > 0 ? Math.round(expectedTotalCost / divisor) : 0;
  }, [expectedTotalCost, effectiveTaxRate]);

  const breakEvenMaxRolls = useMemo(() => {
    const marginForRolls = netRevenue - purchaseCost;
    return activeRerollFee > 0 ? Math.max(0, Math.floor(marginForRolls / activeRerollFee)) : 0;
  }, [netRevenue, purchaseCost, activeRerollFee]);

  // Theoretical Geometric Distribution Percentiles (CDF: P(Rolls <= k) = 1 - (1 - p)^k)
  // For multi-step geometric sum, the Excellent -> Masterpiece step (p = 0.0015, ~667 rolls)
  // overwhelmingly dominates (>96% of variance). We solve for the exact effective parameter p_eff = 1 / expectedRolls.
  const quantiles = useMemo(() => {
    const pEff = 1 / expectedRolls;
    const calculateRollsForQuantile = (q: number) => {
      // 1 - (1 - p)^k = q  =>  (1 - p)^k = 1 - q  =>  k = ln(1 - q) / ln(1 - p)
      if (pEff >= 1) return 1;
      const k = Math.log(1 - q) / Math.log(1 - pEff);
      return Math.max(1, Math.round(k));
    };

    const p25 = calculateRollsForQuantile(0.25);
    const p50 = calculateRollsForQuantile(0.5); // Median
    const p75 = calculateRollsForQuantile(0.75);
    const p90 = calculateRollsForQuantile(0.9); // 90th Percentile Confidence
    const p95 = calculateRollsForQuantile(0.95);
    const p99 = calculateRollsForQuantile(0.99);

    const makeRow = (label: string, rolls: number, desc: string) => {
      const totalCost = purchaseCost + rolls * activeRerollFee;
      const profit = netRevenue - totalCost;
      return {
        label,
        rolls,
        totalCost,
        profit,
        isProfit: profit > 0,
        desc,
      };
    };

    return {
      p25: makeRow('25th (Lucky)', p25, 'Top quartile fortune; rolls hit quickly'),
      p50: makeRow('50th (Median)', p50, 'Standard median outcome; half of items hit here'),
      p75: makeRow('75th Percentile', p75, 'Moderate adverse variance'),
      p90: makeRow('90th (High Risk)', p90, 'Conservative safety bankroll requirement'),
      p95: makeRow('95th (Severe Tail)', p95, 'Severe tail-risk streak; prepare for heavy cost'),
      p99: makeRow('99th (Black Swan)', p99, 'Extreme adverse streak; 1 in 100 catastrophe'),
    };
  }, [expectedRolls, purchaseCost, activeRerollFee, netRevenue]);

  // Fast Monte Carlo Simulation Engine
  // Runs N simulated items from startingQuality -> Masterpiece using geometric sampling
  const [simulationSeed, setSimulationSeed] = useState<number>(0);

  const simulationStats = useMemo<SimulationStats>(() => {
    // Generate simulated roll counts using inverse transform sampling for each step
    const sampleGeometric = (p: number): number => {
      if (p >= 1) return 1;
      const u = Math.random();
      return Math.max(1, Math.ceil(Math.log(1 - u) / Math.log(1 - p)));
    };

    const runs = Math.min(Math.max(simulatedRuns, 100), 20_000);
    const rollResults: number[] = new Array(runs);
    let totalRolls = 0;
    let profitableRunsCount = 0;
    let totalSimulatedProfit = 0;

    for (let i = 0; i < runs; i++) {
      let itemRolls = 0;
      if (startingQuality <= 1) itemRolls += sampleGeometric(probNormalToGood);
      if (startingQuality <= 2) itemRolls += sampleGeometric(probGoodToOutstanding);
      if (startingQuality <= 3) itemRolls += sampleGeometric(probOutstandingToExcellent);
      if (startingQuality <= 4) itemRolls += sampleGeometric(probExcellentToMasterpiece);

      rollResults[i] = itemRolls;
      totalRolls += itemRolls;

      const itemCost = purchaseCost + itemRolls * activeRerollFee;
      const itemProfit = netRevenue - itemCost;
      if (itemProfit > 0) {
        profitableRunsCount++;
      }
      totalSimulatedProfit += itemProfit;
    }

    // Sort to extract empirical percentiles
    rollResults.sort((a, b) => a - b);

    const avgRolls = Math.round(totalRolls / runs);
    const medianRolls = rollResults[Math.floor(runs * 0.5)] ?? avgRolls;
    const p90Rolls = rollResults[Math.floor(runs * 0.9)] ?? avgRolls;
    const p99Rolls = rollResults[Math.floor(runs * 0.99)] ?? avgRolls;
    const minRolls = rollResults[0] ?? 1;
    const maxRolls = rollResults[runs - 1] ?? avgRolls;

    const avgCost = purchaseCost + avgRolls * activeRerollFee;
    const medianCost = purchaseCost + medianRolls * activeRerollFee;
    const p90Cost = purchaseCost + p90Rolls * activeRerollFee;
    const winRate = (profitableRunsCount / runs) * 100;
    const avgProfit = Math.round(totalSimulatedProfit / runs);

    // Build distribution histogram buckets
    const bucketDefs = [
      { max: 250, label: '0 - 250' },
      { max: 500, label: '251 - 500' },
      { max: 750, label: '501 - 750' },
      { max: 1000, label: '751 - 1,000' },
      { max: 1500, label: '1,001 - 1,500' },
      { max: 2000, label: '1,501 - 2,000' },
      { max: Infinity, label: '2,000+' },
    ];

    const counts = bucketDefs.map(() => 0);
    for (const r of rollResults) {
      for (let b = 0; b < bucketDefs.length; b++) {
        if (r <= bucketDefs[b].max) {
          counts[b]++;
          break;
        }
      }
    }

    const distributionBuckets = bucketDefs.map((def, idx) => ({
      range: def.label,
      count: counts[idx],
      percentage: Number(((counts[idx] / runs) * 100).toFixed(1)),
    }));

    return {
      totalRuns: runs,
      avgRolls,
      medianRolls,
      p90Rolls,
      p99Rolls,
      minRolls,
      maxRolls,
      avgCost,
      medianCost,
      p90Cost,
      winRate,
      avgProfit,
      totalSimulatedProfit,
      distributionBuckets,
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    simulatedRuns,
    startingQuality,
    probNormalToGood,
    probGoodToOutstanding,
    probOutstandingToExcellent,
    probExcellentToMasterpiece,
    purchaseCost,
    activeRerollFee,
    netRevenue,
    simulationSeed,
  ]);

  // Interactive Live Forge Handlers
  const handleRollOnce = useCallback(() => {
    if (benchQuality >= 5) return; // Already Masterpiece

    setBenchRolls((prev) => prev + 1);
    setBenchSpentSilver((prev) => prev + activeRerollFee);

    // Roll RNG
    const rand = Math.random();
    let newQuality = benchQuality;

    if (benchQuality === 1) {
      if (rand < probNormalToGood) newQuality = 2;
    } else if (benchQuality === 2) {
      if (rand < probGoodToOutstanding) newQuality = 3;
    } else if (benchQuality === 3) {
      if (rand < probOutstandingToExcellent) newQuality = 4;
    } else if (benchQuality === 4) {
      if (rand < probExcellentToMasterpiece) newQuality = 5;
    }

    if (newQuality > benchQuality) {
      setBenchQuality(newQuality);
      if (soundEnabled) {
        playAlertChime();
      }
    }
  }, [
    benchQuality,
    activeRerollFee,
    probNormalToGood,
    probGoodToOutstanding,
    probOutstandingToExcellent,
    probExcellentToMasterpiece,
    soundEnabled,
  ]);

  // Auto-roll handler
  const handleToggleAutoRoll = useCallback(() => {
    if (benchIsAutoRolling) {
      if (autoRollIntervalRef.current) {
        clearInterval(autoRollIntervalRef.current);
        autoRollIntervalRef.current = null;
      }
      setBenchIsAutoRolling(false);
    } else {
      if (benchQuality >= 5) return;
      setBenchIsAutoRolling(true);
      autoRollIntervalRef.current = window.setInterval(() => {
        setBenchQuality((curQ) => {
          if (curQ >= 5) {
            if (autoRollIntervalRef.current) {
              clearInterval(autoRollIntervalRef.current);
              autoRollIntervalRef.current = null;
            }
            setBenchIsAutoRolling(false);
            if (soundEnabled) {
              playAlertChime();
            }
            return 5;
          }

          setBenchRolls((r) => r + 1);
          setBenchSpentSilver((s) => s + activeRerollFee);

          const rand = Math.random();
          let nextQ = curQ;
          if (curQ === 1 && rand < probNormalToGood) nextQ = 2;
          else if (curQ === 2 && rand < probGoodToOutstanding) nextQ = 3;
          else if (curQ === 3 && rand < probOutstandingToExcellent) nextQ = 4;
          else if (curQ === 4 && rand < probExcellentToMasterpiece) nextQ = 5;

          if (nextQ >= 5 && soundEnabled) {
            playAlertChime();
          }
          return nextQ;
        });
      }, 40); // 25 rolls/sec
    }
  }, [
    benchIsAutoRolling,
    benchQuality,
    activeRerollFee,
    probNormalToGood,
    probGoodToOutstanding,
    probOutstandingToExcellent,
    probExcellentToMasterpiece,
    soundEnabled,
  ]);

  // Clean up auto-roll interval on unmount
  useEffect(() => {
    return () => {
      if (autoRollIntervalRef.current) {
        clearInterval(autoRollIntervalRef.current);
      }
    };
  }, []);

  const handleResetBench = useCallback(() => {
    if (autoRollIntervalRef.current) {
      clearInterval(autoRollIntervalRef.current);
      autoRollIntervalRef.current = null;
    }
    setBenchIsAutoRolling(false);
    setBenchQuality(startingQuality);
    setBenchRolls(0);
    setBenchSpentSilver(0);
  }, [startingQuality]);

  // Preset selector handler
  const applyPreset = (preset: ItemPreset) => {
    setTier(preset.tier);
    setEnchantment(preset.enchantment);
    setPurchaseCost(preset.purchaseCost);
    setBmBuyOrderPrice(preset.bmBuyOrderPrice);
    setIsCustomFee(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-[#121826] border border-slate-800 rounded-2xl p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              System 5
            </span>
            <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
              Binomial &bull; Geometric Distribution
            </span>
            <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
              <Dices className="h-5 w-5 text-purple-400" />
              <span>+EV Equipment Quality Reroll Simulator</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
            Exploit the mathematical spread between royal repair station reroll mechanics and Black Market Masterpiece buy orders. Model binomial quality upgrades, geometric tail variance, and positive expected value (+EV) thresholds before committing silver.
          </p>
        </div>

        {/* Global Summary Badge */}
        <div
          className={`border rounded-xl px-5 py-3 text-right font-mono flex-shrink-0 transition-all ${
            isPositiveEV
              ? 'bg-emerald-950/40 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
              : 'bg-rose-950/40 border-rose-500/40 shadow-lg shadow-rose-950/20'
          }`}
        >
          <div className="flex items-center justify-end gap-1.5 mb-0.5">
            {isPositiveEV ? (
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-rose-400" />
            )}
            <span
              className={`text-xs uppercase font-bold tracking-wider ${
                isPositiveEV ? 'text-emerald-300' : 'text-rose-300'
              }`}
            >
              {isPositiveEV ? '+EV Opportunity' : '-EV Negative Spread'}
            </span>
          </div>
          <span
            className={`text-xl font-extrabold tracking-tight block ${
              isPositiveEV ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isPositiveEV ? '+' : ''}
            {formatSilver(expectedNetValue)}
            <span className="text-xs font-normal text-slate-400 ml-1.5 font-sans">
              ({expectedRoi >= 0 ? '+' : ''}
              {expectedRoi.toFixed(1)}% ROI)
            </span>
          </span>
        </div>
      </div>

      {/* Quick Load Presets Bar */}
      <div className="bg-[#121826]/80 border border-slate-800/80 rounded-xl p-3 flex items-center gap-2.5 overflow-x-auto no-scrollbar">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 flex-shrink-0 pl-1">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>Quick Presets:</span>
        </span>
        <div className="flex items-center gap-2 flex-nowrap">
          {PRESETS.map((p) => {
            const isSelected = tier === p.tier && enchantment === p.enchantment && purchaseCost === p.purchaseCost;
            return (
              <button
                key={p.name}
                onClick={() => applyPreset(p)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-purple-600/30 border-purple-400 text-purple-200 font-bold shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
                title={p.description}
              >
                <span>{p.name}</span>
                <span className="text-[10px] text-amber-400/80">({formatSilver(p.bmBuyOrderPrice)})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Control Panel (5 Cols) & Mathematical Dashboard (7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Interactive Parameter Inputs (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-[#121826] border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                <Sliders className="h-4 w-4 text-purple-400" />
                <span>Equipment & Reroll Parameters</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">T{tier}.{enchantment} Base</span>
            </div>

            {/* Tier Selector (T4-T8) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Base Item Tier</span>
                <span className="text-[11px] text-slate-500">Tier Multiplier: {TIER_FEE_MULTIPLIERS[tier]}x</span>
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[4, 5, 6, 7, 8].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTier(t)}
                    className={`py-2 rounded-lg border text-xs font-mono font-bold transition-all ${
                      tier === t
                        ? TIER_COLORS[t]
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    T{t}
                  </button>
                ))}
              </div>
            </div>

            {/* Enchantment Selector (.0 - .3) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Enchantment Level</span>
                <span className="text-[11px] text-slate-500">IV Multiplier: {ENCHANT_MULTIPLIERS[enchantment]}x</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[0, 1, 2, 3].map((e) => (
                  <button
                    key={e}
                    onClick={() => setEnchantment(e)}
                    className={`py-2 rounded-lg border text-xs font-mono font-bold transition-all ${
                      enchantment === e
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    .{e}
                  </button>
                ))}
              </div>
            </div>

            {/* Starting Quality Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Starting Item Quality</span>
                <span className="text-[11px] text-slate-500">Normal (1) to Excellent (4)</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 2, 3, 4].map((q) => (
                  <button
                    key={q}
                    onClick={() => setStartingQuality(q)}
                    className={`py-2 px-1 rounded-lg border text-xs font-medium transition-all text-center truncate ${
                      startingQuality === q
                        ? QUALITY_COLORS[q]
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {QUALITY_NAMES[q]}
                  </button>
                ))}
              </div>
            </div>

            {/* Royal City Purchase Price & Black Market MP Buy Order Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Royal City Cost</span>
                  <span className="text-[10px] text-slate-500">Base Buy Price</span>
                </label>
                <div className="relative">
                  <Coins className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="number"
                    min={0}
                    step={5000}
                    value={purchaseCost}
                    onChange={(e) => setPurchaseCost(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-400 transition-colors"
                    placeholder="95000"
                  />
                </div>
                <span className="text-[11px] text-slate-400 font-mono block text-right">
                  {formatSilver(purchaseCost)} Silver
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>BM Masterpiece Order</span>
                  <span className="text-[10px] text-amber-400">Target Payout</span>
                </label>
                <div className="relative">
                  <Target className="absolute left-3 top-2.5 h-3.5 w-3.5 text-amber-400" />
                  <input
                    type="number"
                    min={0}
                    step={50000}
                    value={bmBuyOrderPrice}
                    onChange={(e) => setBmBuyOrderPrice(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-amber-300 font-bold focus:outline-none focus:border-amber-400 transition-colors"
                    placeholder="3850000"
                  />
                </div>
                <span className="text-[11px] text-amber-400 font-mono block text-right">
                  {formatSilver(bmBuyOrderPrice)} Silver
                </span>
              </div>
            </div>

            {/* Repair Station Fee Configuration */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  <span>Station Reroll Fee per Roll</span>
                </span>
                <button
                  onClick={() => setIsCustomFee(!isCustomFee)}
                  className="text-[11px] text-purple-400 hover:text-purple-300 underline font-medium"
                >
                  {isCustomFee ? 'Reset to Auto-Formula' : 'Set Custom Fee'}
                </button>
              </div>

              {isCustomFee ? (
                <div className="space-y-1">
                  <div className="relative">
                    <Coins className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="number"
                      min={100}
                      step={500}
                      value={customFeeInput}
                      onChange={(e) => setCustomFeeInput(Math.max(1, Number(e.target.value) || 0))}
                      className="w-full bg-slate-950 border border-purple-500/50 rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Custom override: {formatSilver(customFeeInput)} / roll
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs font-mono bg-slate-950/60 px-3 py-2 rounded-lg border border-slate-800/80">
                  <span className="text-slate-400">
                    Base IV ({DEFAULT_BASE_ITEM_VALUES[tier]}) &times; {TIER_FEE_MULTIPLIERS[tier]}x &times; {ENCHANT_MULTIPLIERS[enchantment]}x
                  </span>
                  <span className="text-amber-400 font-bold">{formatSilver(autoRerollFee)} Silver</span>
                </div>
              )}
              <p className="text-[10px] text-slate-500 leading-tight">
                Albion Repair Station formula: Base Item Value &times; Tier Multiplier &times; Enchantment Multiplier. Benchmark: approx 2k-15k/roll for T5-T7 enchanted.
              </p>
            </div>

            {/* Tax Settings & Simulation Runs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Tax Mode Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Market Order Type</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Tax: {(effectiveTaxRate * 100).toFixed(1)}%
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                  <button
                    onClick={() => setTaxMode('direct_fill')}
                    className={`py-1.5 px-2 rounded text-[11px] font-medium transition-all ${
                      taxMode === 'direct_fill'
                        ? 'bg-purple-600 text-white font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Direct Fill ({hasPremium ? '4%' : '8%'})
                  </button>
                  <button
                    onClick={() => setTaxMode('sell_order')}
                    className={`py-1.5 px-2 rounded text-[11px] font-medium transition-all ${
                      taxMode === 'sell_order'
                        ? 'bg-purple-600 text-white font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Sell Order ({hasPremium ? '6.5%' : '10.5%'})
                  </button>
                </div>
              </div>

              {/* Number of Simulated Runs */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Simulated Items</span>
                  <span className="text-[10px] text-purple-400 font-mono">{simulatedRuns} items</span>
                </label>
                <select
                  value={simulatedRuns}
                  onChange={(e) => setSimulatedRuns(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                >
                  <option value={500}>500 Items (Fast)</option>
                  <option value={1000}>1,000 Items (Standard)</option>
                  <option value={2500}>2,500 Items (High Rigor)</option>
                  <option value={5000}>5,000 Items (Ultra Precision)</option>
                  <option value={10000}>10,000 Items (Maximum)</option>
                </select>
              </div>
            </div>

            {/* Premium Toggle */}
            <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800/80 rounded-xl px-3.5 py-2.5">
              <span className="text-xs text-slate-300 font-medium flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-400" />
                <span>Premium Status</span>
              </span>
              <button
                onClick={() => setHasPremium(!hasPremium)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all border ${
                  hasPremium
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {hasPremium ? 'Active (Halved Tax)' : 'Inactive'}
              </button>
            </div>

            {/* Advanced Probability Distribution Accordion */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Percent className="h-3.5 w-3.5 text-purple-400" />
                  <span>Quality Upgrade Probabilities (Albion RNG)</span>
                </span>
                {showAdvanced ? (
                  <ChevronUp className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </button>

              {showAdvanced && (
                <div className="p-3.5 pt-1 space-y-3 border-t border-slate-800/80 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Normal &rarr; Good:</span>
                      <span className="text-emerald-400 font-bold">{(probNormalToGood * 100).toFixed(1)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0.1}
                      max={0.9}
                      step={0.05}
                      value={probNormalToGood}
                      onChange={(e) => setProbNormalToGood(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Good &rarr; Outstanding:</span>
                      <span className="text-blue-400 font-bold">{(probGoodToOutstanding * 100).toFixed(1)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0.05}
                      max={0.5}
                      step={0.01}
                      value={probGoodToOutstanding}
                      onChange={(e) => setProbGoodToOutstanding(Number(e.target.value))}
                      className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Outstanding &rarr; Excellent:</span>
                      <span className="text-purple-400 font-bold">{(probOutstandingToExcellent * 100).toFixed(1)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0.01}
                      max={0.2}
                      step={0.005}
                      value={probOutstandingToExcellent}
                      onChange={(e) => setProbOutstandingToExcellent(Number(e.target.value))}
                      className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Excellent &rarr; Masterpiece:</span>
                      <span className="text-amber-400 font-bold">{(probExcellentToMasterpiece * 100).toFixed(2)}% (1 in {Math.round(1 / probExcellentToMasterpiece)})</span>
                    </div>
                    <input
                      type="range"
                      min={0.0005}
                      max={0.005}
                      step={0.0001}
                      value={probExcellentToMasterpiece}
                      onChange={(e) => setProbExcellentToMasterpiece(Number(e.target.value))}
                      className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() => {
                        setProbNormalToGood(0.5);
                        setProbGoodToOutstanding(0.25);
                        setProbOutstandingToExcellent(0.05);
                        setProbExcellentToMasterpiece(0.0015);
                      }}
                      className="text-[10px] text-slate-400 hover:text-slate-200 underline font-mono"
                    >
                      Reset to Official Invariants
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Live Forge / Test Bench */}
          <div className="bg-[#121826] border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-400" />
                <span>Live Repair Station Test Bench</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1 rounded text-slate-400 hover:text-slate-200 transition-colors"
                  title={soundEnabled ? 'Mute sound chime' : 'Enable sound chime'}
                >
                  {soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-amber-400" /> : <VolumeX className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={handleResetBench}
                  className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 font-mono"
                  title="Reset test item"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Current Item Quality Stage Indicator */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Current Item Quality:</span>
                <span
                  className={`text-xs px-2.5 py-1 rounded-lg border font-mono font-bold ${
                    QUALITY_COLORS[benchQuality]
                  }`}
                >
                  {QUALITY_NAMES[benchQuality]}
                </span>
              </div>

              {/* Progress track */}
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((q) => {
                  const isReached = benchQuality >= q;
                  const isCurrent = benchQuality === q;
                  return (
                    <div
                      key={q}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isCurrent
                          ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                          : isReached
                          ? 'bg-purple-500'
                          : 'bg-slate-800'
                      }`}
                      title={QUALITY_NAMES[q]}
                    />
                  );
                })}
              </div>
            </div>

            {/* Bench Live Ticker Counters */}
            <div className="grid grid-cols-2 gap-2 bg-slate-900/90 rounded-xl p-3 border border-slate-800/80 font-mono text-xs">
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Rolls Attempted</span>
                <span className="text-sm font-bold text-white">{benchRolls}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Silver Expended</span>
                <span className="text-sm font-bold text-amber-400">-{formatSilver(benchSpentSilver)}</span>
              </div>
            </div>

            {/* Interactive Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleRollOnce}
                disabled={benchQuality >= 5 || benchIsAutoRolling}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  benchQuality >= 5
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 cursor-default'
                    : 'bg-purple-600 hover:bg-purple-500 border-purple-400 text-white shadow-md shadow-purple-950/30 active:scale-95'
                }`}
              >
                {benchQuality >= 5 ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Masterpiece Hit!</span>
                  </>
                ) : (
                  <>
                    <Dices className="h-3.5 w-3.5" />
                    <span>Roll 1 Attempt</span>
                  </>
                )}
              </button>

              <button
                onClick={handleToggleAutoRoll}
                disabled={benchQuality >= 5}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  benchIsAutoRolling
                    ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
                    : benchQuality >= 5
                    ? 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                }`}
              >
                {benchIsAutoRolling ? (
                  <>
                    <Square className="h-3.5 w-3.5" />
                    <span>Stop Auto-Roll</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 text-amber-400" />
                    <span>Auto-Roll to MP</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Mathematical Outputs, EV Spread & Confidence Intervals (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* 4 Core Financial KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Card 1: Expected Net Value (EV) */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                isPositiveEV
                  ? 'bg-[#121826] border-emerald-500/40 shadow-lg shadow-emerald-950/10'
                  : 'bg-[#121826] border-rose-500/40 shadow-lg shadow-rose-950/10'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                  <TrendingUp className={`h-3.5 w-3.5 ${isPositiveEV ? 'text-emerald-400' : 'text-rose-400'}`} />
                  <span>Expected Net Value (EV)</span>
                </span>
                <span
                  className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded font-mono ${
                    isPositiveEV
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {isPositiveEV ? '+EV' : '-EV'}
                </span>
              </div>
              <div
                className={`text-2xl font-extrabold font-mono tracking-tight ${
                  isPositiveEV ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPositiveEV ? '+' : ''}
                {formatSilver(expectedNetValue)}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center justify-between">
                <span>Expected ROI:</span>
                <span className={isPositiveEV ? 'text-emerald-300 font-bold' : 'text-rose-300 font-bold'}>
                  {expectedRoi >= 0 ? '+' : ''}
                  {expectedRoi.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Card 2: Expected Total Silver Cost */}
            <div className="bg-[#121826] border border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                  <Coins className="h-3.5 w-3.5 text-amber-400" />
                  <span>Expected Total Cost</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  ~{Math.round(expectedRolls)} rolls
                </span>
              </div>
              <div className="text-2xl font-extrabold font-mono text-white tracking-tight">
                {formatSilver(expectedTotalCost)}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center justify-between">
                <span>Reroll Fees Share:</span>
                <span className="text-amber-400 font-bold">
                  {formatSilver(expectedRerollCost)} ({Math.round((expectedRerollCost / expectedTotalCost) * 100)}%)
                </span>
              </div>
            </div>

            {/* Card 3: 50th Percentile (Median) Cost */}
            <div className="bg-[#121826] border border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-blue-400" />
                  <span>Median Cost (P50)</span>
                </span>
                <span className="text-[10px] text-blue-400 font-mono">
                  {quantiles.p50.rolls} rolls
                </span>
              </div>
              <div className="text-2xl font-extrabold font-mono text-blue-300 tracking-tight">
                {formatSilver(quantiles.p50.totalCost)}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center justify-between">
                <span>Profit at P50:</span>
                <span className={quantiles.p50.isProfit ? 'text-emerald-300 font-bold' : 'text-rose-300 font-bold'}>
                  {quantiles.p50.isProfit ? '+' : ''}
                  {formatSilver(quantiles.p50.profit)}
                </span>
              </div>
            </div>

            {/* Card 4: 90th Percentile (Conservative) Cost */}
            <div className="bg-[#121826] border border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-orange-400" />
                  <span>90th Percentile Cost (P90)</span>
                </span>
                <span className="text-[10px] text-orange-400 font-mono">
                  {quantiles.p90.rolls} rolls
                </span>
              </div>
              <div className="text-2xl font-extrabold font-mono text-orange-300 tracking-tight">
                {formatSilver(quantiles.p90.totalCost)}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center justify-between">
                <span>Profit at P90:</span>
                <span className={quantiles.p90.isProfit ? 'text-emerald-300 font-bold' : 'text-rose-300 font-bold'}>
                  {quantiles.p90.isProfit ? '+' : ''}
                  {formatSilver(quantiles.p90.profit)}
                </span>
              </div>
            </div>
          </div>

          {/* Break-Even & Risk Management Bar */}
          <div className="bg-[#121826] border border-slate-800 rounded-2xl p-4.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Break-Even Thresholds & Stop-Loss Limits</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Net Payout: {formatSilver(netRevenue)} Silver
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase block">Min BM Price for +EV</span>
                <span className="text-base font-bold text-white">{formatSilver(breakEvenSellPrice)} Silver</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Spread vs Current: {bmBuyOrderPrice >= breakEvenSellPrice ? '+' : ''}
                  {formatSilver(bmBuyOrderPrice - breakEvenSellPrice)} Silver
                </span>
              </div>

              <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase block">Stop-Loss Max Rolls</span>
                <span className="text-base font-bold text-amber-400">{breakEvenMaxRolls} rolls</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Exceeding this number of rolls turns item into net loss
                </span>
              </div>
            </div>
          </div>

          {/* Theoretical Geometric Confidence Intervals Table */}
          <div className="bg-[#121826] border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-purple-400" />
                  <span>Geometric Tail Variance & Confidence Intervals</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Exact cumulative distribution function (CDF) for hitting Masterpiece from {QUALITY_NAMES[startingQuality]}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="pb-2 font-semibold">Confidence Tier</th>
                    <th className="pb-2 font-semibold text-right">Required Rolls</th>
                    <th className="pb-2 font-semibold text-right">Total Silver Cost</th>
                    <th className="pb-2 font-semibold text-right">Net Spread (Profit/Loss)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {Object.values(quantiles).map((q) => (
                    <tr key={q.label} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-2.5">
                        <span className="font-bold text-slate-200 block">{q.label}</span>
                        <span className="text-[10px] text-slate-500 font-sans">{q.desc}</span>
                      </td>
                      <td className="py-2.5 text-right font-bold text-slate-200">
                        {q.rolls.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right text-slate-300">
                        {formatSilver(q.totalCost)}
                      </td>
                      <td
                        className={`py-2.5 text-right font-bold ${
                          q.isProfit ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {q.isProfit ? '+' : ''}
                        {formatSilver(q.profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monte Carlo Empirical Simulation Dashboard */}
          <div className="bg-[#121826] border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>Monte Carlo Empirical Trial Results ({simulationStats.totalRuns.toLocaleString()} runs)</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Simulated randomized repair station outcomes based on binomial quality transitions
                </p>
              </div>
              <button
                onClick={() => setSimulationSeed((s) => s + 1)}
                className="px-3 py-1.5 rounded-lg border border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 text-xs font-mono font-bold flex items-center gap-1.5 transition-all self-end sm:self-auto"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Re-Sample Monte Carlo</span>
              </button>
            </div>

            {/* Empirical Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
              <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase block">Empirical Win Rate</span>
                <span
                  className={`text-base font-extrabold ${
                    simulationStats.winRate >= 50 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {simulationStats.winRate.toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Profitable Runs</span>
              </div>

              <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase block">Avg Rolls (Sim)</span>
                <span className="text-base font-extrabold text-white">
                  {simulationStats.avgRolls}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Min: {simulationStats.minRolls} | Max: {simulationStats.maxRolls}
                </span>
              </div>

              <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase block">Avg Cost (Sim)</span>
                <span className="text-base font-extrabold text-amber-400">
                  {formatSilver(simulationStats.avgCost)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  P50: {formatSilver(simulationStats.medianCost)}
                </span>
              </div>

              <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase block">Total Net Profit</span>
                <span
                  className={`text-base font-extrabold ${
                    simulationStats.totalSimulatedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {simulationStats.totalSimulatedProfit >= 0 ? '+' : ''}
                  {formatSilver(simulationStats.totalSimulatedProfit)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Across all {simulationStats.totalRuns} items
                </span>
              </div>
            </div>

            {/* Distribution Histogram Bars */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Rolls to Masterpiece Distribution Frequency</span>
                <span className="text-[10px] text-slate-500 font-mono">% of simulated items</span>
              </span>

              <div className="space-y-1.5 font-mono text-xs">
                {simulationStats.distributionBuckets.map((bucket) => {
                  const maxPercent = Math.max(
                    ...simulationStats.distributionBuckets.map((b) => b.percentage),
                    1
                  );
                  const barWidth = Math.max(2, (bucket.percentage / maxPercent) * 100);

                  return (
                    <div key={bucket.range} className="space-y-0.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">{bucket.range} rolls</span>
                        <span className="text-slate-200">
                          {bucket.count} items ({bucket.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-purple-600 to-amber-500 rounded-full transition-all duration-300"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RerollSimulator;
