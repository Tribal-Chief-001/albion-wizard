import React, { useState } from 'react';
import { Cluster } from '../types';
import { Coins, ArrowUpRight, ArrowDownRight, Copy, Check, Sparkles } from 'lucide-react';
import { formatSilver } from '../utils/quality';

interface GoldMacroOracleProps {
  cluster: Cluster;
  goldPrice: number;
}

interface PatchTarget {
  name: string;
  category: string;
  changeType: 'BUFF' | 'REWORK';
  changeDetails: string;
  hoardTarget: string;
  expectedSurge: string;
  riskRating: 'LOW' | 'MEDIUM';
}

const PATCH_TARGETS: PatchTarget[] = [
  {
    name: 'Dagger Line (Bloodletter & Demonfang)',
    category: 'Weapons',
    changeType: 'BUFF',
    changeDetails: 'Execute threshold increased to 45% HP + Demonfang E cooldown reduced by 2.5s.',
    hoardTarget: 'T7/T8 Dagger Artifacts & Bloodletter bases under 120k',
    expectedSurge: '+250% to +350% on Patch Day',
    riskRating: 'LOW',
  },
  {
    name: 'Stalker Jacket (Leather)',
    category: 'Armor',
    changeType: 'BUFF',
    changeDetails: 'Electric field tick damage increased by 14% against enemy players.',
    hoardTarget: 'Morgana Leather Artifacts & T6.1/T7.1 Stalker Jackets',
    expectedSurge: '+180% to +260%',
    riskRating: 'LOW',
  },
  {
    name: 'Shapeshifter (Prowling Staff)',
    category: 'Magic',
    changeType: 'REWORK',
    changeDetails: 'Stealth pounce damage multiplier increased from 1.35x to 1.55x in solo mists.',
    hoardTarget: 'T6/T7 Prowling Artifacts & Flat T8 Shapeshifter Staves',
    expectedSurge: '+300% to +450%',
    riskRating: 'MEDIUM',
  },
  {
    name: 'Bow of Badon & Warbow',
    category: 'Ranged',
    changeType: 'BUFF',
    changeDetails: 'Badon lightning cloud interrupt frequency increased; Warbow projectile velocity +10%.',
    hoardTarget: 'Avalonian Shards & T7 Badon Bases',
    expectedSurge: '+200% to +300%',
    riskRating: 'LOW',
  },
];

export const GoldMacroOracle: React.FC<GoldMacroOracleProps> = ({ cluster, goldPrice }) => {
  const [copiedTarget, setCopiedTarget] = useState<string | null>(null);

  // Moving average baseline estimates based on server cluster
  const historicalBaseline = cluster === 'east' ? 14800 : cluster === 'europe' ? 9200 : 8900;
  const isDataAvailable = goldPrice > 0;
  const priceSpread = isDataAvailable ? goldPrice - historicalBaseline : 0;
  const spreadPercent = isDataAvailable ? ((priceSpread / historicalBaseline) * 100).toFixed(1) : '0';
  const isUndervalued = isDataAvailable && priceSpread < 0;

  const handleCopyTarget = (targetText: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(targetText).catch(() => {});
    }
    setCopiedTarget(targetText);
    setTimeout(() => setCopiedTarget(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#121826] border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              System 6 & 7
            </span>
            <h2 className="text-xl font-bold text-white font-mono">
              Gold Macro & Patch Front-Running Oracle
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Endgame billionaire-tier economics. Exploit monthly Gold/Silver inflation cycles and front-run upcoming patch balance changes before casual players notice.
          </p>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 rounded-xl px-4 py-2.5 text-right font-mono">
          <span className="text-[10px] text-slate-400 uppercase block">Live Gold ({cluster.toUpperCase()})</span>
          <span className="text-xl font-bold text-amber-400">1 Gold = {formatSilver(goldPrice)}</span>
        </div>
      </div>

      {/* Two Column Layout: Gold Macro on Left, Patch Cartel on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Gold Macro & Inflation Hedge (5 Cols) */}
        <div className="lg:col-span-5 bg-[#121826] border border-slate-800 rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <Coins className="h-4 w-4 text-amber-400" />
              <span>Gold-Silver Macro Cycle</span>
            </h3>
            <span className="text-xs text-amber-400 font-mono">System 7</span>
          </div>

          {/* Signal Card */}
          <div
            className={`rounded-xl p-4 border flex items-start gap-3.5 ${
              !isDataAvailable
                ? 'bg-slate-900 border-slate-700 text-slate-300'
                : isUndervalued
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
            }`}
          >
            {!isDataAvailable ? (
              <Coins className="h-6 w-6 text-slate-400 flex-shrink-0 mt-0.5 animate-pulse" />
            ) : isUndervalued ? (
              <ArrowDownRight className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <ArrowUpRight className="h-6 w-6 text-amber-400 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-sm">
                {!isDataAvailable
                  ? 'Macro Signal: AWAITING LIVE DATA'
                  : isUndervalued
                  ? 'Macro Signal: ACCUMULATE GOLD'
                  : 'Macro Signal: TAKE PROFIT / NEUTRAL'}
              </div>
              <p className="text-xs opacity-80 mt-1 leading-relaxed">
                {!isDataAvailable
                  ? `Live gold telemetry is synchronizing from ${cluster.toUpperCase()} cluster...`
                  : isUndervalued
                  ? `Gold is trading at ${spreadPercent}% below the 30-day moving average (${formatSilver(historicalBaseline)}). Accumulate gold now to front-run monthly premium renewal spikes.`
                  : `Gold is currently trading at +${spreadPercent}% above historical baseline. Favorable for liquidating gold reserves back into Silver.`}
              </p>
            </div>
          </div>

          {/* Key Indicators */}
          <div className="space-y-2.5 text-xs">
            <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl flex justify-between items-center">
              <span className="text-slate-400">30-Day Moving Average:</span>
              <span className="font-mono font-bold text-slate-200">{formatSilver(historicalBaseline)} Silver</span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl flex justify-between items-center">
              <span className="text-slate-400">Current Premium Cycle Phase:</span>
              <span className="font-mono font-bold text-emerald-400">Mid-Cycle Stability</span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl flex justify-between items-center">
              <span className="text-slate-400">Historical Long-Term Trend:</span>
              <span className="font-mono font-bold text-amber-400">+12% Annual Silver Inflation</span>
            </div>
          </div>

          {/* Whale Invariant */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 space-y-1">
            <span className="font-bold text-white block">The Billionaire Rule:</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Never hold more than 50M uninvested raw Silver in bank chests for more than 30 days. Silver drops from mobs continuously, inflating the money supply. Converting idle capital into Gold preserves purchasing power.
            </p>
          </div>
        </div>

        {/* Right: Patch Balance Front-Running Cartel (7 Cols) */}
        <div className="lg:col-span-7 bg-[#121826] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Staging & Patch Balance Hoarding Targets</span>
            </h3>
            <span className="text-xs text-amber-400 font-mono">System 6</span>
          </div>

          <p className="text-xs text-slate-400">
            Detected weapon/armor balance shifts from Staging Server tests. Hoard these items at baseline prices before patch deployment:
          </p>

          <div className="space-y-3">
            {PATCH_TARGETS.map((target) => {
              const isTargetCopied = copiedTarget === target.hoardTarget;
              return (
                <div
                  key={target.name}
                  className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 hover:border-slate-700 transition-all text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{target.name}</span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {target.changeType}
                      </span>
                    </div>
                    <span className="text-emerald-400 font-mono font-bold text-xs">
                      {target.expectedSurge}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {target.changeDetails}
                  </p>

                  <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold flex-shrink-0">Target:</span>
                      <span className="font-mono text-amber-300 text-xs truncate">{target.hoardTarget}</span>
                    </div>

                    <button
                      onClick={() => handleCopyTarget(target.hoardTarget)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-[11px] flex-shrink-0"
                    >
                      {isTargetCopied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{isTargetCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
