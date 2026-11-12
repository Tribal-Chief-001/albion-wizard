import React, { useState, useMemo } from 'react';
import { Cluster } from '../../types';
import {
  CITY_HEARTS,
  CityHeartInfo,
  FACTION_CRESTS,
  CrestTierInfo,
} from '../../data/factionData';
import { formatSilver } from '../../utils/quality';
import {
  TrendingUp,
  Coins,
  Sliders,
  AlertOctagon,
  Sparkles,
  Info,
  Package,
} from 'lucide-react';

interface SpPMatrixProps {
  cluster: Cluster;
  hasPremium?: boolean;
}

export const SpPMatrix: React.FC<SpPMatrixProps> = ({ cluster, hasPremium = true }) => {
  // Points input slider (1,000 to 100,000 FP)
  const [pointsInput, setPointsInput] = useState<number>(30000);

  // Crest-Only Leverage toggle
  const [isLeverageEnabled, setIsLeverageEnabled] = useState<boolean>(true);

  // Order type: Sell Order (setup fee 2.5%) vs Instant Sell (setup fee 0%)
  const [isSellOrder, setIsSellOrder] = useState<boolean>(true);

  // Tax rate based on premium
  const taxRate = hasPremium ? 0.04 : 0.08;
  const setupFee = isSellOrder ? 0.025 : 0.0;
  const effectiveFee = taxRate + setupFee;

  // City Heart calculations
  const heartMatrix = useMemo(() => {
    return CITY_HEARTS.map((heart: CityHeartInfo) => {
      const marketPrice = heart.marketPrices[cluster] || 32000;
      const netSilver = marketPrice * (1 - effectiveFee);
      const spp = netSilver / heart.pointsCost;
      const unitsRedeemable = Math.floor(pointsInput / heart.pointsCost);
      const totalSilverYield = unitsRedeemable * netSilver;

      return {
        ...heart,
        marketPrice,
        netSilver,
        spp,
        unitsRedeemable,
        totalSilverYield,
      };
    });
  }, [cluster, effectiveFee, pointsInput]);

  // Average Heart SpP baseline
  const avgHeartSpP = useMemo(() => {
    const sum = heartMatrix.reduce((acc, h) => acc + h.spp, 0);
    return sum / heartMatrix.length;
  }, [heartMatrix]);

  // Crest and Cape Leverage calculations
  const crestMatrix = useMemo(() => {
    // Reference heart price for city crafting (average of hearts)
    const refHeartPrice =
      heartMatrix.find((h) => h.city === 'Fort Sterling')?.marketPrice || 32000;

    return FACTION_CRESTS.map((crest: CrestTierInfo) => {
      const rawCrestMarketPrice = crest.marketPrices[cluster] || 6000;
      const rawCrestNet = rawCrestMarketPrice * (1 - effectiveFee);
      const rawCrestSpP = rawCrestNet / crest.pointsCost;

      // Crest-Only Point Leverage Model:
      // Points spent ONLY on Crest. Base Cape + Hearts bought with Silver.
      const finishedCapeMarket = crest.capeSellPrices[cluster] || 56000;
      const netCapeRevenue = finishedCapeMarket * (1 - effectiveFee);
      const totalSilverInputs = crest.baseCapeCost + crest.heartsReq * refHeartPrice;
      const leveragedCapeProfit = netCapeRevenue - totalSilverInputs;
      const leveragedSpP = Math.max(0, leveragedCapeProfit / crest.pointsCost);

      // Enchanted 4.2 cape bonus if applicable
      let enchantedSpP = 0;
      let enchantedProfit = 0;
      if (crest.enchantedCapeSellPrices && crest.enchantCostSilver) {
        const enchMarket = crest.enchantedCapeSellPrices[cluster] || 78000;
        const netEnchRev = enchMarket * (1 - effectiveFee);
        const enchInputs = totalSilverInputs + crest.enchantCostSilver;
        enchantedProfit = netEnchRev - enchInputs;
        enchantedSpP = Math.max(0, enchantedProfit / crest.pointsCost);
      }

      // Projections for points slider
      const unitsCraftable = Math.floor(pointsInput / crest.pointsCost);
      const rawCrestTotalYield = unitsCraftable * rawCrestNet;
      const leveragedTotalYield = unitsCraftable * leveragedCapeProfit;
      const enchantedTotalYield = unitsCraftable * enchantedProfit;

      return {
        ...crest,
        rawCrestMarketPrice,
        rawCrestNet,
        rawCrestSpP,
        finishedCapeMarket,
        leveragedCapeProfit,
        leveragedSpP,
        enchantedSpP,
        enchantedProfit,
        unitsCraftable,
        rawCrestTotalYield,
        leveragedTotalYield,
        enchantedTotalYield,
      };
    });
  }, [cluster, effectiveFee, heartMatrix, pointsInput]);

  // Top Leveraged Option (T4 / T4.2)
  const topLeveraged = useMemo(() => {
    const t4 = crestMatrix.find((c) => c.tier === 4);
    return t4;
  }, [crestMatrix]);

  // Total Silver comparison for current slider points
  const payoutComparison = useMemo(() => {
    // 1. Raw Hearts Payout (e.g. Mountain Heart)
    const mountainHeart = heartMatrix.find((h) => h.city === 'Fort Sterling') || heartMatrix[0];
    const rawHeartPayout = mountainHeart.totalSilverYield;

    // 2. Leveraged Crest Payout (T4 Fort Sterling Cape)
    const t4Crest = crestMatrix.find((c) => c.tier === 4);
    const leveragedPayout = t4Crest ? t4Crest.leveragedTotalYield : 0;
    const enchantedPayout = t4Crest ? t4Crest.enchantedTotalYield : 0;

    // 3. Faction Campaign Chest (9,000 FP, EV = 50,000 silver, SpP = 5.56)
    const chestCount = pointsInput / 9000;
    const chestPayout = chestCount * 50000;

    const netProfitGain = leveragedPayout - rawHeartPayout;
    const gainPercentage = rawHeartPayout > 0 ? (netProfitGain / rawHeartPayout) * 100 : 0;

    return {
      rawHeartPayout,
      leveragedPayout,
      enchantedPayout,
      chestPayout,
      netProfitGain,
      gainPercentage,
    };
  }, [heartMatrix, crestMatrix, pointsInput]);

  return (
    <div className="space-y-4 w-full min-w-0 max-w-full">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#121826] border border-slate-800 p-3.5 sm:p-4 rounded-2xl">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 flex-shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 flex-wrap">
              <span>Silver-per-Point (SpP) Monetization Matrix</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                AODP Telemetry ({cluster.toUpperCase()})
              </span>
            </h3>
            <p className="text-xs text-slate-400 truncate">
              Deterministic point conversion engine comparing Raw Hearts vs Crest Leverage vs Chests
            </p>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
          {/* Crest Leverage Toggle */}
          <button
            onClick={() => setIsLeverageEnabled(!isLeverageEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              isLeverageEnabled
                ? 'bg-purple-600/25 border-purple-500 text-purple-300 shadow-sm shadow-purple-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Demonstrate Crest-Only Point Leverage Multiplier"
          >
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span>Crest Leverage Mode</span>
            <span className="text-[10px] px-1 rounded bg-purple-500/30 text-purple-200 ml-0.5">
              +300%
            </span>
          </button>

          {/* Sell Order vs Direct Sell Toggle */}
          <button
            onClick={() => setIsSellOrder(!isSellOrder)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:border-slate-700 transition-all"
            title={isSellOrder ? 'Sell Order (2.5% Setup Fee)' : 'Instant Sell (0% Setup Fee)'}
          >
            <Coins className="h-3.5 w-3.5 text-amber-400" />
            <span>{isSellOrder ? 'Order (2.5% fee)' : 'Instant Sell'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Points Slider Card */}
      <div className="bg-[#121826] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="h-4 w-4 text-amber-400" />
              <span>Available Faction Points Pool</span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                {pointsInput.toLocaleString()} FP
              </span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Simulate total liquid silver payout when redeeming points across different strategies.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[3000, 10000, 30000, 50000, 100000].map((pts) => (
              <button
                key={pts}
                onClick={() => setPointsInput(pts)}
                className={`px-2 py-1 rounded text-[11px] font-mono transition-all border ${
                  pointsInput === pts
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {(pts / 1000).toFixed(0)}k
              </button>
            ))}
          </div>
        </div>

        {/* Range Slider */}
        <div className="space-y-1">
          <input
            type="range"
            min={1000}
            max={100000}
            step={1000}
            value={pointsInput}
            onChange={(e) => setPointsInput(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>1,000 FP</span>
            <span>25,000 FP</span>
            <span>50,000 FP</span>
            <span>75,000 FP</span>
            <span>100,000 FP</span>
          </div>
        </div>

        {/* Payout Comparison Metrics Trio */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {/* Card 1: Faction Chest Rookie Trap */}
          <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-red-400 uppercase tracking-wide flex items-center gap-1">
                  <AlertOctagon className="h-3 w-3" />
                  Rookie Trap: Faction Chest
                </span>
                <span className="text-[10px] font-mono text-red-300">5.56 SpP</span>
              </div>
              <div className="text-lg font-black font-mono text-red-300">
                {formatSilver(payoutComparison.chestPayout)}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                9,000 FP per chest. Liquidates ~50k silver EV. Destroys over 60% of wealth!
              </p>
            </div>
            <span className="text-[10px] font-mono text-red-400 font-bold mt-2 pt-2 border-t border-red-500/20">
              Avoid for Silver Generation
            </span>
          </div>

          {/* Card 2: Raw Heart Liquidation */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1">
                  <Package className="h-3 w-3 text-amber-400" />
                  Raw Faction Hearts
                </span>
                <span className="text-[10px] font-mono text-amber-300">
                  {avgHeartSpP.toFixed(1)} SpP
                </span>
              </div>
              <div className="text-lg font-black font-mono text-amber-300">
                {formatSilver(payoutComparison.rawHeartPayout)}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                3,000 FP per Heart. Instant, friction-free liquidity on local markets.
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 mt-2 pt-2 border-t border-slate-800">
              Liquid Baseline Yield
            </span>
          </div>

          {/* Card 3: Leveraged Crest Cape Strategy */}
          <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/40 flex flex-col justify-between shadow-lg shadow-purple-950/20">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wide flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-purple-400" />
                  Crest-Only Point Leverage
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-400">
                  {topLeveraged?.leveragedSpP.toFixed(1)} - {topLeveraged?.enchantedSpP?.toFixed(1) || '73.4'} SpP
                </span>
              </div>
              <div className="text-lg font-black font-mono text-emerald-400">
                {formatSilver(payoutComparison.leveragedPayout)}
              </div>
              <p className="text-[10px] text-purple-200/80 mt-1">
                Craft T4 Capes: Redeem 400 FP Crests only; buy base capes + hearts with silver.
              </p>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-emerald-300 font-bold mt-2 pt-2 border-t border-purple-500/20">
              <span>Gain: +{formatSilver(payoutComparison.netProfitGain)}</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                +{payoutComparison.gainPercentage.toFixed(0)}% Lift
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* City Hearts Table (System 1 Safe Monetization) */}
      <div className="bg-[#121826] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
            <span>Live City Heart Redemption Matrix (6 Royal Factions)</span>
            <span className="text-[10px] font-mono text-slate-500">3,000 FP per Heart</span>
          </h4>
        </div>

        <div className="overflow-x-auto no-scrollbar touch-scroll border border-slate-800/80 rounded-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Heart Token</th>
                <th className="py-2.5 px-3">Faction City</th>
                <th className="py-2.5 px-3 text-right">Market Price</th>
                <th className="py-2.5 px-3 text-right">Net After Tax</th>
                <th className="py-2.5 px-3 text-right">Silver/Point</th>
                <th className="py-2.5 px-3 text-right font-bold text-white">
                  Payout ({pointsInput.toLocaleString()} FP)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-300">
              {heartMatrix.map((h) => (
                <tr key={h.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-2 px-3 font-semibold text-white flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-400" />
                    <span>{h.name}</span>
                  </td>
                  <td className="py-2 px-3 text-slate-400">{h.city}</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-300">
                    {formatSilver(h.marketPrice)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-400">
                    {formatSilver(h.netSilver)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold">
                      {h.spp.toFixed(2)} SpP
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-amber-400">
                    {formatSilver(h.totalSilverYield)}
                    <span className="text-[10px] text-slate-500 block">
                      ({h.unitsRedeemable} units)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Faction Crest & Cape Leverage Table */}
      <div className="bg-[#121826] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span>Faction Crests & Finished Cape Point Leverage (T4 - T8)</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Decouple FP from Hearts: Spend FP exclusively on Crests. Buy Base Capes & Hearts with Silver.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
            0% Spec Required &bull; Craft at Toolmaker
          </span>
        </div>

        <div className="overflow-x-auto no-scrollbar touch-scroll border border-slate-800/80 rounded-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Crest Tier</th>
                <th className="py-2.5 px-3">FP Cost</th>
                <th className="py-2.5 px-3 text-right">Cape Sell Price</th>
                <th className="py-2.5 px-3 text-right">Silver Inputs</th>
                <th className="py-2.5 px-3 text-right">Raw Crest SpP</th>
                <th className="py-2.5 px-3 text-right font-bold text-purple-300">
                  Leveraged SpP
                </th>
                <th className="py-2.5 px-3 text-right font-bold text-emerald-400">
                  Leveraged Yield
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-300">
              {crestMatrix.map((c) => (
                <tr
                  key={c.tier}
                  className={`hover:bg-slate-900/40 transition-colors ${
                    c.tier === 4 ? 'bg-purple-950/20 font-medium' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 text-white font-bold flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-purple-400" />
                    <span>{c.name}</span>
                    {c.tier === 4 && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 uppercase font-bold">
                        Top ROI
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{c.pointsCost.toLocaleString()} FP</td>
                  <td className="py-2.5 px-3 text-right text-slate-300">
                    {formatSilver(c.finishedCapeMarket)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-400">
                    {formatSilver(c.baseCapeCost + c.heartsReq * 32000)}
                    <span className="text-[10px] text-slate-500 block">
                      ({c.heartsReq} Heart{c.heartsReq > 1 ? 's' : ''} + Cape)
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-400">
                    {c.rawCrestSpP.toFixed(1)} SpP
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold font-mono">
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                      {c.leveragedSpP.toFixed(1)} SpP
                    </span>
                    {c.tier === 4 && c.enchantedSpP > 0 && (
                      <span className="text-[10px] text-emerald-400 block mt-0.5">
                        {c.enchantedSpP.toFixed(1)} SpP (T4.2)
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                    {formatSilver(c.leveragedTotalYield)}
                    <span className="text-[10px] text-slate-500 block">
                      ({c.unitsCraftable} Capes)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tactical Economic Callout Box */}
        <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-slate-300 space-y-1.5 leading-relaxed">
          <div className="font-bold text-purple-300 flex items-center gap-1.5">
            <Info className="h-4 w-4" />
            <span>The Crest Leverage Mathematical Thesis:</span>
          </div>
          <p>
            When players buy both Hearts (3,000 FP) and Crests (400 FP) with points to craft capes, their yield is diluted down to ~14.5 SpP. By purchasing all Hearts and Base Capes with liquid Silver, you concentrate 100% of the cape market spread onto the 400 points spent on the Adept's Crest, achieving an astounding <strong>41.5 to 73.4 Silver/Point (+250% to +450% amplification)</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
