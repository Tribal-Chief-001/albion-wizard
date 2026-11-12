import React from 'react';
import { Cluster, NavigationTab } from '../types';
import { Coins, Bell, BellOff, Crown, Globe, ShieldAlert, Wand2, Truck, Zap, Flame, TrendingUp, Dices } from 'lucide-react';
import { formatSilver } from '../utils/quality';

interface NavbarProps {
  cluster: Cluster;
  onClusterChange: (c: Cluster) => void;
  goldPrice: number;
  hasPremium: boolean;
  onPremiumToggle: () => void;
  audioEnabled: boolean;
  onAudioToggle: () => void;
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  manifestCount: number;
  onOpenManifest: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cluster,
  onClusterChange,
  goldPrice,
  hasPremium,
  onPremiumToggle,
  audioEnabled,
  onAudioToggle,
  activeTab,
  onTabChange,
  manifestCount,
  onOpenManifest,
}) => {
  return (
    <header className="border-b border-slate-800 bg-[#0e131f]/95 backdrop-blur sticky top-0 z-40 px-4 lg:px-8 py-2.5 space-y-2.5">
      {/* Top Utility Bar */}
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 p-0.5 shadow-lg shadow-amber-500/20 flex-shrink-0">
            <div className="h-full w-full rounded-[10px] bg-slate-950 flex items-center justify-center">
              <Wand2 className="h-4 w-4 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white text-base font-mono">
                ALBION <span className="text-amber-400">WIZARD</span>
              </span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                v2.0 Pro
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Algorithmic Silver Maximization & Economic Dominance Suite
            </p>
          </div>
        </div>

        {/* Global Controls & Actions */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Transport Run Cart Button */}
          <button
            onClick={onOpenManifest}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-all ${
              manifestCount > 0
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-sm shadow-amber-500/10'
                : 'bg-slate-900 border-slate-700/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Truck className="h-3.5 w-3.5 text-amber-400" />
            <span>Transport Run</span>
            {manifestCount > 0 && (
              <span className="h-4.5 w-4.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center font-mono">
                {manifestCount}
              </span>
            )}
          </button>

          {/* Cluster Switcher */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded-lg p-0.5 text-xs">
            <Globe className="h-3.5 w-3.5 text-slate-400 ml-1.5" />
            {(['west', 'europe', 'east'] as Cluster[]).map((c) => (
              <button
                key={c}
                onClick={() => onClusterChange(c)}
                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                  cluster === c
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {c === 'west' ? 'Americas' : c === 'europe' ? 'Europe' : 'Asia'}
              </button>
            ))}
          </div>

          {/* Gold Price Indicator */}
          {goldPrice > 0 && (
            <div className="hidden md:flex items-center gap-1.5 bg-slate-900/90 border border-amber-500/30 px-2.5 py-1.5 rounded-lg text-xs text-amber-300 font-mono">
              <Coins className="h-3.5 w-3.5 text-amber-400" />
              <span>1G = {formatSilver(goldPrice)}</span>
            </div>
          )}

          {/* Premium Toggle */}
          <button
            onClick={onPremiumToggle}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              hasPremium
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title={hasPremium ? 'Premium Active (4% Tax)' : 'No Premium (8% Tax)'}
          >
            <Crown className={`h-3.5 w-3.5 ${hasPremium ? 'text-amber-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">{hasPremium ? 'Premium 4%' : 'Free 8%'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onAudioToggle}
            className={`p-1.5 rounded-lg border text-xs transition-all ${
              audioEnabled
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
            title={audioEnabled ? 'Sound alerts enabled' : 'Sound alerts disabled'}
          >
            {audioEnabled ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Navigation Suite Tabs */}
      <div className="max-w-7xl mx-auto flex items-center gap-2 border-t border-slate-800/80 pt-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => onTabChange('black_market')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border whitespace-nowrap ${
            activeTab === 'black_market'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
              : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Flame className="h-3.5 w-3.5" />
          <span>Black Market Predator</span>
        </button>

        <button
          onClick={() => onTabChange('faction_matrix')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border whitespace-nowrap ${
            activeTab === 'faction_matrix'
              ? 'bg-blue-500 text-white border-blue-400 shadow-sm'
              : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>Faction Point Arbitrage</span>
        </button>

        <button
          onClick={() => onTabChange('refining_lab')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border whitespace-nowrap ${
            activeTab === 'refining_lab'
              ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
              : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="h-3.5 w-3.5" />
          <span>700/700 Focus & Refining Lab</span>
        </button>

        <button
          onClick={() => onTabChange('reroll_sim')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border whitespace-nowrap ${
            activeTab === 'reroll_sim'
              ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
              : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Dices className="h-3.5 w-3.5" />
          <span>+EV Quality Reroll (System 5)</span>
        </button>

        <button
          onClick={() => onTabChange('macro_oracle')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border whitespace-nowrap ${
            activeTab === 'macro_oracle'
              ? 'bg-purple-500 text-white border-purple-400 shadow-sm'
              : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5" />
          <span>Gold Macro & Patch Oracle</span>
        </button>
      </div>
    </header>
  );
};
