import React from 'react';
import { ArbitrageOpportunity } from '../types';
import { TrendingUp, Flame, DollarSign, RefreshCw, Layers } from 'lucide-react';
import { formatSilver } from '../utils/quality';

interface StatsBannerProps {
  opportunities: ArbitrageOpportunity[];
  isLoading: boolean;
  onRefresh: () => void;
  lastUpdated: Date | null;
  totalCatalogCount: number;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({
  opportunities,
  isLoading,
  onRefresh,
  lastUpdated,
  totalCatalogCount,
}) => {
  const starvationCount = opportunities.filter((o) => o.isStarvation).length;
  const maxRoi = opportunities.reduce((max, o) => Math.max(max, o.roiPercentage), 0);
  const totalPotentialProfit = opportunities.reduce((acc, curr) => acc + curr.netProfit, 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
      {/* Metric 1: Opportunities */}
      <div className="bg-[#121826] border border-slate-800/90 rounded-xl p-3 sm:p-3.5 flex flex-col justify-between min-w-0">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span className="truncate">Active Flips</span>
          <Layers className="h-4 w-4 text-blue-400 flex-shrink-0 ml-1" />
        </div>
        <div className="text-xl sm:text-2xl font-bold font-mono text-white truncate">
          {opportunities.length}
        </div>
        <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1 truncate">
          From {totalCatalogCount} tracked items
        </div>
      </div>

      {/* Metric 2: Starvation Permutations */}
      <div className="bg-[#121826] border border-amber-500/30 rounded-xl p-3 sm:p-3.5 flex flex-col justify-between shadow-sm shadow-amber-500/5 min-w-0">
        <div className="flex items-center justify-between text-amber-300 text-xs mb-1">
          <span className="font-semibold flex items-center gap-1 truncate">
            <Flame className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" /> <span className="truncate">Starvations</span>
          </span>
          <span className="text-[9px] sm:text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono flex-shrink-0 ml-1">
            &ge; 150%
          </span>
        </div>
        <div className="text-xl sm:text-2xl font-bold font-mono text-amber-400 truncate">
          {starvationCount}
        </div>
        <div className="text-[10px] sm:text-[11px] text-amber-300/60 mt-1 truncate">
          Zero supply price-ramps
        </div>
      </div>

      {/* Metric 3: Peak ROI */}
      <div className="bg-[#121826] border border-slate-800/90 rounded-xl p-3 sm:p-3.5 flex flex-col justify-between min-w-0">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span className="truncate">Peak ROI Spread</span>
          <TrendingUp className="h-4 w-4 text-emerald-400 flex-shrink-0 ml-1" />
        </div>
        <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 truncate">
          +{maxRoi}%
        </div>
        <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1 truncate">
          After taxes & market fees
        </div>
      </div>

      {/* Metric 4: Total Value Pool */}
      <div className="bg-[#121826] border border-slate-800/90 rounded-xl p-3 sm:p-3.5 flex flex-col justify-between min-w-0">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span className="truncate">Total Net Pool</span>
          <DollarSign className="h-4 w-4 text-amber-400 flex-shrink-0 ml-1" />
        </div>
        <div className="text-xl sm:text-2xl font-bold font-mono text-amber-300 truncate">
          {formatSilver(totalPotentialProfit)}
        </div>
        <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1 truncate">
          Filtered net profit pool
        </div>
      </div>

      {/* Refresh & Sync Card */}
      <div className="col-span-2 md:col-span-4 lg:col-span-1 bg-[#121826] border border-slate-800/90 rounded-xl p-3 sm:p-3.5 flex flex-col justify-between min-w-0">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span>Data Sync</span>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-amber-500/10 disabled:opacity-50 min-h-[38px]"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Scanning...' : 'Scan Market'}</span>
        </button>
        <div className="text-[10px] text-slate-500 mt-1 text-center font-mono truncate">
          {lastUpdated ? `Synced: ${lastUpdated.toLocaleTimeString()}` : 'Awaiting initial scan'}
        </div>
      </div>
    </div>
  );
};
