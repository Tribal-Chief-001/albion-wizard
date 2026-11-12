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
    <header className="border-b border-slate-800 bg-[#0e131f]/95 backdrop-blur sticky top-0 z-40 px-3 sm:px-4 lg:px-8 py-2 sm:py-2.5 w-full max-w-full overflow-hidden">
      {/* Top Utility Bar */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 md:gap-3 w-full min-w-0">
        {/* Row 1 on Mobile: Brand + Mobile Quick Actions (Transport & Sound) */}
        <div className="flex items-center justify-between w-full min-w-0 md:w-auto">
          {/* Brand */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 p-0.5 shadow-lg shadow-amber-500/20 flex-shrink-0">
              <div className="h-full w-full rounded-[10px] bg-slate-950 flex items-center justify-center">
                <Wand2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold tracking-tight text-white text-sm sm:text-base font-mono truncate">
                  ALBION <span className="text-amber-400">WIZARD</span>
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex-shrink-0">
                  v2.0 Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block truncate">
                Algorithmic Silver Maximization & Economic Dominance Suite
              </p>
            </div>
          </div>

          {/* Quick Actions for Mobile (< md) */}
          <div className="flex md:hidden items-center gap-1.5 flex-shrink-0">
            {/* Transport Run Button */}
            <button
              onClick={onOpenManifest}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-medium min-h-[36px] text-xs transition-all ${
                manifestCount > 0
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-sm shadow-amber-500/10'
                  : 'bg-slate-900 border-slate-700/80 text-slate-400'
              }`}
              title="Open Transport Run Cart"
            >
              <Truck className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
              <span>Run</span>
              {manifestCount > 0 && (
                <span className="h-4.5 w-4.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center font-mono">
                  {manifestCount}
                </span>
              )}
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onAudioToggle}
              className={`p-2 rounded-lg border text-xs min-h-[36px] min-w-[36px] flex items-center justify-center transition-all ${
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

        {/* Row 2 on Mobile / Right Controls on Desktop (md+) */}
        <div className="flex items-center justify-between md:justify-end gap-1.5 md:gap-2 text-xs w-full md:w-auto min-w-0">
          {/* Cluster Switcher */}
          <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-900 border border-slate-700/80 rounded-lg p-0.5 text-xs min-h-[36px] flex-shrink-0">
            <Globe className="h-3.5 w-3.5 text-slate-400 ml-1 sm:ml-1.5 hidden md:block flex-shrink-0" />
            {(['west', 'europe', 'east'] as Cluster[]).map((c) => (
              <button
                key={c}
                onClick={() => onClusterChange(c)}
                className={`px-1.5 sm:px-2 py-1 rounded text-xs font-medium transition-all ${
                  cluster === c
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={c === 'west' ? 'Americas Cluster' : c === 'europe' ? 'Europe Cluster' : 'Asia Cluster'}
              >
                <span className="md:hidden">{c === 'west' ? 'US' : c === 'europe' ? 'EU' : 'ASIA'}</span>
                <span className="hidden md:inline">{c === 'west' ? 'Americas' : c === 'europe' ? 'Europe' : 'Asia'}</span>
              </button>
            ))}
          </div>

          {/* Gold Price Indicator */}
          {goldPrice > 0 && (
            <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-900/90 border border-amber-500/30 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs text-amber-300 font-mono min-h-[36px] flex-shrink-0">
              <Coins className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
              <span>1G={formatSilver(goldPrice)}</span>
            </div>
          )}

          {/* Premium Toggle */}
          <button
            onClick={onPremiumToggle}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-medium border min-h-[36px] transition-all flex-shrink-0 ${
              hasPremium
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title={hasPremium ? 'Premium Active (4% Tax)' : 'No Premium (8% Tax)'}
          >
            <Crown className={`h-3.5 w-3.5 flex-shrink-0 ${hasPremium ? 'text-amber-400' : 'text-slate-400'}`} />
            <span>{hasPremium ? '4% Prem' : '8% Free'}</span>
          </button>

          {/* Desktop-only Transport Run Cart Button (Hidden on Mobile < md) */}
          <button
            onClick={onOpenManifest}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium min-h-[36px] transition-all flex-shrink-0 ${
              manifestCount > 0
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-sm shadow-amber-500/10'
                : 'bg-slate-900 border-slate-700/80 text-slate-400 hover:text-slate-200'
            }`}
            title="Open Transport Run Cart"
          >
            <Truck className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
            <span>Transport Run</span>
            {manifestCount > 0 && (
              <span className="h-4.5 w-4.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center font-mono">
                {manifestCount}
              </span>
            )}
          </button>

          {/* Desktop-only Sound Toggle (Hidden on Mobile < md) */}
          <button
            onClick={onAudioToggle}
            className={`hidden md:flex p-2 rounded-lg border text-xs min-h-[36px] min-w-[36px] items-center justify-center transition-all flex-shrink-0 ${
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

      {/* Navigation Suite Tabs (Isolated from canvas blowout) */}
      <div className="w-full max-w-full min-w-0 border-t border-slate-800/80 mt-2 pt-2 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar touch-scroll pb-1 w-full min-w-0">
          <button
            onClick={() => onTabChange('black_market')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border whitespace-nowrap min-h-[36px] flex-shrink-0 ${
              activeTab === 'black_market'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Black Market Predator</span>
          </button>

          <button
            onClick={() => onTabChange('faction_matrix')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border whitespace-nowrap min-h-[36px] flex-shrink-0 ${
              activeTab === 'faction_matrix'
                ? 'bg-blue-500 text-white border-blue-400 shadow-sm'
                : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Faction Point Matrix</span>
          </button>

          <button
            onClick={() => onTabChange('refining_lab')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border whitespace-nowrap min-h-[36px] flex-shrink-0 ${
              activeTab === 'refining_lab'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="h-3.5 w-3.5 flex-shrink-0" />
            <span>700/700 Focus & Refining</span>
          </button>

          <button
            onClick={() => onTabChange('reroll_sim')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border whitespace-nowrap min-h-[36px] flex-shrink-0 ${
              activeTab === 'reroll_sim'
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Dices className="h-3.5 w-3.5 flex-shrink-0" />
            <span>+EV Quality Reroll (Sys 5)</span>
          </button>

          <button
            onClick={() => onTabChange('macro_oracle')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border whitespace-nowrap min-h-[36px] flex-shrink-0 ${
              activeTab === 'macro_oracle'
                ? 'bg-purple-500 text-white border-purple-400 shadow-sm'
                : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Gold Macro & Patch Oracle</span>
          </button>
        </div>
      </div>
    </header>
  );
};
