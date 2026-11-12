import React, { useState } from 'react';
import { ResourceBiome } from '../types';
import {
  BIOME_CONFIGS,
  calculateFocusCost,
  calculateRRR,
  NPC_TIER_TRANSMUTE_COSTS,
  NPC_ENCHANT_TRANSMUTE_COSTS,
} from '../data/refining';
import { Sparkles, Zap, CheckCircle } from 'lucide-react';
import { formatSilver } from '../utils/quality';

export const RefiningLab: React.FC = () => {
  const [selectedBiome, setSelectedBiome] = useState<ResourceBiome>('Hide');
  const [tier, setTier] = useState<number>(6);
  const [enchantment, setEnchantment] = useState<number>(1);
  const [tierSpec, setTierSpec] = useState<number>(100);
  const [masterySpec, setMasterySpec] = useState<number>(100);
  const [useFocus, setUseFocus] = useState<boolean>(true);
  const [inBonusCity, setInBonusCity] = useState<boolean>(true);
  const [dailyBonus, setDailyBonus] = useState<boolean>(false);

  // Dynamic calculations
  const biomeInfo = BIOME_CONFIGS[selectedBiome];
  const rrr = calculateRRR(inBonusCity, useFocus, dailyBonus);
  const rrrPercent = (rrr * 100).toFixed(1);

  const focusPerCraft = useFocus ? calculateFocusCost(tier, masterySpec, tierSpec) : 0;
  const dailyFocusAvailable = 10000;
  const craftsPerDay = focusPerCraft > 0 ? Math.floor(dailyFocusAvailable / focusPerCraft) : 1000;

  // Typical market spreads estimate for refining
  // T4: ~150-250 silver margin per craft
  // T5: ~400-800
  // T6: ~1,500-3,500
  // T7: ~5,000-12,000
  // T8: ~20,000-50,000
  const baseMarginMultiplier = Math.pow(2.8, tier - 4) * (1 + enchantment * 0.4);
  const estimatedNetProfitPerCraft = Math.round(180 * baseMarginMultiplier * (1 + rrr));
  const dailyPassiveProfit = craftsPerDay * estimatedNetProfitPerCraft;
  const silverPerFocus = focusPerCraft > 0 ? Math.round(estimatedNetProfitPerCraft / focusPerCraft) : 0;

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-[#121826] border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              System 3 & 4
            </span>
            <h2 className="text-xl font-bold text-white font-mono">
              700/700 SPF & Transmutation Compounding Lab
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Mathematical safe-zone silver printing. Optimize daily 10,000 Focus Points with 53.9% Resource Return Rates (RRR) and exploit NPC Transmutation negative-cycles.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-right font-mono">
          <span className="text-[10px] text-slate-400 uppercase block">Daily Focus Yield</span>
          <span className="text-lg font-bold text-amber-400">+{formatSilver(dailyPassiveProfit)} / day</span>
        </div>
      </div>

      {/* Main Grid: Refining Optimizer on Left, Transmutation Matrix on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Focus Refining Studio (7 Cols) */}
        <div className="lg:col-span-7 bg-[#121826] border border-slate-800 rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Refining Efficiency Studio</span>
            </h3>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
              Optimal City: {biomeInfo.bonusCity}
            </span>
          </div>

          {/* Biome Selector */}
          <div>
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-2">
              Select Resource Biome:
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(['Wood', 'Ore', 'Fiber', 'Hide', 'Stone'] as ResourceBiome[]).map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBiome(b)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border text-center ${
                    selectedBiome === b
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Tier & Enchantment Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Tier */}
            <div>
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-2">
                Tier:
              </label>
              <div className="flex gap-1.5">
                {[4, 5, 6, 7, 8].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTier(t)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                      tier === t
                        ? 'bg-slate-800 border-amber-400 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    T{t}
                  </button>
                ))}
              </div>
            </div>

            {/* Enchantment */}
            <div>
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-2">
                Enchantment:
              </label>
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map((e) => (
                  <button
                    key={e}
                    onClick={() => setEnchantment(e)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                      enchantment === e
                        ? 'bg-slate-800 border-emerald-400 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    .{e}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Specialization Sliders */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">T{tier} Specific Mastery Spec</span>
                <span className="font-mono font-bold text-amber-400">{tierSpec} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={tierSpec}
                onChange={(e) => setTierSpec(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Total Resource Branch Mastery</span>
                <span className="font-mono font-bold text-amber-400">{masterySpec} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={masterySpec}
                onChange={(e) => setMasterySpec(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Condition Toggles */}
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => setUseFocus(!useFocus)}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                useFocus
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              ⚡ Use Focus Points
            </button>
            <button
              onClick={() => setInBonusCity(!inBonusCity)}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                inBonusCity
                  ? 'bg-blue-500/20 border-blue-500 text-blue-300 font-semibold'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              🏛️ Bonus City ({biomeInfo.bonusCity})
            </button>
            <button
              onClick={() => setDailyBonus(!dailyBonus)}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                dailyBonus
                  ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-semibold'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              🔥 Daily Production Event (+10% RRR)
            </button>
          </div>

          {/* Metric Outputs */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Return Rate (RRR)</span>
              <span className="text-xl font-bold font-mono text-emerald-400">{rrrPercent}%</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Focus per Craft</span>
              <span className="text-xl font-bold font-mono text-amber-400">{focusPerCraft} pts</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Silver Per Focus (SPF)</span>
              <span className="text-xl font-bold font-mono text-purple-400">{silverPerFocus} SPF</span>
            </div>
          </div>
        </div>

        {/* Right: NPC Transmutation Matrix & Arbitrage (5 Cols) */}
        <div className="lg:col-span-5 bg-[#121826] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span>NPC Transmutation Negative-Cycles</span>
            </h3>
            <span className="text-[10px] uppercase font-bold text-purple-300 bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 rounded">
              System 4
            </span>
          </div>

          <p className="text-xs text-slate-400">
            NPC Transmuters upgrade raw resources at deterministic silver fees. When market raw prices spike, transmuting lower tiers prints guaranteed arbitrage:
          </p>

          {/* Tier Transmute Table */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
              Tier Upgrades ($N \to N+1$):
            </span>
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl overflow-hidden text-xs">
              {Object.entries(NPC_TIER_TRANSMUTE_COSTS).map(([jump, cost]) => (
                <div
                  key={jump}
                  className="flex items-center justify-between p-2.5 border-b border-slate-800/80 last:border-b-0"
                >
                  <span className="font-mono font-bold text-slate-200">Tier {jump}</span>
                  <span className="text-slate-400 font-mono">NPC Fee: <strong className="text-amber-400">{formatSilver(cost)}</strong></span>
                </div>
              ))}
            </div>
          </div>

          {/* Enchantment Transmute Table for Current Tier */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
              T{tier} Enchantment Upgrades (.0 $\to$ .1 $\to$ .2 $\to$ .3):
            </span>
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl overflow-hidden text-xs">
              {Object.entries(NPC_ENCHANT_TRANSMUTE_COSTS[tier] || {}).map(([jump, cost]) => (
                <div
                  key={jump}
                  className="flex items-center justify-between p-2.5 border-b border-slate-800/80 last:border-b-0"
                >
                  <span className="font-mono font-bold text-slate-200">.{jump}</span>
                  <span className="text-slate-400 font-mono">NPC Fee: <strong className="text-emerald-400">{formatSilver(cost)}</strong></span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Strategy Callout */}
          <div className="bg-purple-950/30 border border-purple-800/50 rounded-xl p-3.5 text-xs text-purple-200 space-y-1">
            <div className="font-semibold text-purple-300 flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-purple-400" />
              <span>Negative Cycle Strategy:</span>
            </div>
            <p className="text-[11px] text-purple-300/80 leading-relaxed">
              If <strong>[Raw T{tier}.0 Price + NPC Upgrade Fee]</strong> is less than <strong>[Raw T{tier}.{enchantment} Market Price]</strong>, never buy enchanted raw materials directly! Transmute flat materials at the NPC bank and refine with 53.9% RRR to pocket the spread.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
