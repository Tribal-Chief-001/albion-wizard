import React from 'react';
import { Cluster } from '../types';
import { Coins, Bell, BellOff, Crown, Globe, ShieldAlert, Wand2 } from 'lucide-react';
import { formatSilver } from '../utils/quality';

interface NavbarProps {
  cluster: Cluster;
  onClusterChange: (c: Cluster) => void;
  goldPrice: number;
  hasPremium: boolean;
  onPremiumToggle: () => void;
  audioEnabled: boolean;
  onAudioToggle: () => void;
  onOpenFactionModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cluster,
  onClusterChange,
  goldPrice,
  hasPremium,
  onPremiumToggle,
  audioEnabled,
  onAudioToggle,
  onOpenFactionModal,
}) => {
  return (
    <header className="border-b border-slate-800 bg-[#0e131f]/90 backdrop-blur sticky top-0 z-40 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 p-0.5 shadow-lg shadow-amber-500/20">
            <div className="h-full w-full rounded-[10px] bg-slate-950 flex items-center justify-center">
              <Wand2 className="h-5 w-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white text-lg font-mono">
                ALBION <span className="text-amber-400">WIZARD</span>
              </span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                v1.0 Live
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Black Market Starvation & Zero-Risk Arbitrage Cockpit
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Faction Matrix Shortcut */}
          <button
            onClick={onOpenFactionModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 transition-all"
            title="System 1: Faction Point to Hearts Arbitrage"
          >
            <ShieldAlert className="h-3.5 w-3.5 text-blue-400" />
            <span className="hidden md:inline">Faction Matrix</span>
          </button>

          {/* Cluster Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-lg p-1 text-xs">
            <Globe className="h-3.5 w-3.5 text-slate-400 ml-1.5" />
            {(['west', 'europe', 'east'] as Cluster[]).map((c) => (
              <button
                key={c}
                onClick={() => onClusterChange(c)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
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
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs text-amber-300 font-mono">
              <Coins className="h-3.5 w-3.5 text-amber-400" />
              <span>1 Gold = {formatSilver(goldPrice)}</span>
            </div>
          )}

          {/* Premium Toggle */}
          <button
            onClick={onPremiumToggle}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              hasPremium
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/10'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title={hasPremium ? 'Premium Active (4% Tax)' : 'No Premium (8% Tax)'}
          >
            <Crown className={`h-3.5 w-3.5 ${hasPremium ? 'text-amber-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">{hasPremium ? 'Premium (4% Tax)' : 'Free (8% Tax)'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onAudioToggle}
            className={`p-2 rounded-lg border text-xs transition-all ${
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
    </header>
  );
};
