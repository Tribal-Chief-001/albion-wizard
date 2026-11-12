import React, { useState } from 'react';
import { Cluster } from '../../types';
import { BanditRadar } from './BanditRadar';
import { SpPMatrix } from './SpPMatrix';
import { SmugglerRoutePlanner } from './SmugglerRoutePlanner';
import { LeechPlaybook } from './LeechPlaybook';
import {
  ShieldAlert,
  Radio,
  TrendingUp,
  Truck,
  Shield,
  ShieldCheck,
  Globe,
} from 'lucide-react';

interface FactionCommandCenterProps {
  cluster: Cluster;
  hasPremium?: boolean;
  audioEnabled?: boolean;
}

export type FactionSubTab = 'bandit_radar' | 'spp_matrix' | 'smuggler_routes' | 'leech_playbook';

export const FactionCommandCenter: React.FC<FactionCommandCenterProps> = ({
  cluster,
  hasPremium = true,
  audioEnabled = true,
}) => {
  const [subTab, setSubTab] = useState<FactionSubTab>('bandit_radar');

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0 max-w-full overflow-hidden">
      {/* Bloomberg-Dark Master Header */}
      <section className="bg-[#121826] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden min-w-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-600/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="h-8 w-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 flex-shrink-0">
                <ShieldAlert className="h-4.5 w-4.5" />
              </span>
              <h1 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2 font-mono truncate">
                <span>FACTION WARFARE</span>
                <span className="text-amber-400">COMMAND CENTER</span>
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase font-bold flex-shrink-0">
                System 1 & 8 Active
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Algorithmic decision support for Bandit Assault prediction, Crest-Only Point Leverage monetization, 100% safe smuggler trade runs, and un-gankable 0-spec leech mechanics.
            </p>
          </div>

          {/* Telemetry Status Badges */}
          <div className="flex items-center gap-2 flex-wrap self-start md:self-auto flex-shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs font-mono text-slate-300">
              <Globe className="h-3.5 w-3.5 text-amber-400" />
              <span>{cluster.toUpperCase()} Cluster</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs font-mono text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>100% EAC & ToS Safe</span>
            </div>
          </div>
        </div>

        {/* Bloomberg Sub-Navigation Pills */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar touch-scroll pb-1 w-full min-w-0">
          <button
            onClick={() => setSubTab('bandit_radar')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap min-h-[38px] flex-shrink-0 ${
              subTab === 'bandit_radar'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm shadow-amber-500/20'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Bandit Assault Radar</span>
          </button>

          <button
            onClick={() => setSubTab('spp_matrix')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap min-h-[38px] flex-shrink-0 ${
              subTab === 'spp_matrix'
                ? 'bg-blue-500 text-white border-blue-400 shadow-sm shadow-blue-500/20'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5 flex-shrink-0" />
            <span>SpP Monetization Matrix</span>
          </button>

          <button
            onClick={() => setSubTab('smuggler_routes')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap min-h-[38px] flex-shrink-0 ${
              subTab === 'smuggler_routes'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm shadow-emerald-500/20'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Truck className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Smuggler Route Planner</span>
          </button>

          <button
            onClick={() => setSubTab('leech_playbook')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap min-h-[38px] flex-shrink-0 ${
              subTab === 'leech_playbook'
                ? 'bg-purple-600 text-white border-purple-500 shadow-sm shadow-purple-500/20'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="h-3.5 w-3.5 flex-shrink-0" />
            <span>19k Leech Playbook</span>
          </button>
        </div>
      </section>

      {/* Active Sub-Tab View */}
      <section className="w-full min-w-0 max-w-full">
        {subTab === 'bandit_radar' && (
          <BanditRadar cluster={cluster} audioEnabled={audioEnabled} />
        )}
        {subTab === 'spp_matrix' && (
          <SpPMatrix cluster={cluster} hasPremium={hasPremium} />
        )}
        {subTab === 'smuggler_routes' && (
          <SmugglerRoutePlanner cluster={cluster} />
        )}
        {subTab === 'leech_playbook' && (
          <LeechPlaybook />
        )}
      </section>
    </div>
  );
};
