import React, { useState } from 'react';
import { ArbitrageOpportunity } from '../types';
import { Copy, Check, ArrowRight, Flame, Plus } from 'lucide-react';
import { formatSilver, QUALITY_COLORS, QUALITY_NAMES, TIER_COLORS } from '../utils/quality';

interface ArbitrageCardProps {
  opp: ArbitrageOpportunity;
  onCopied?: (name: string) => void;
  onAddToManifest?: (opp: ArbitrageOpportunity) => void;
}

export const ArbitrageCard: React.FC<ArbitrageCardProps> = ({ opp, onCopied, onAddToManifest }) => {
  const [copied, setCopied] = useState(false);
  const [added, setAdded] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(opp.item.name).catch(() => {});
    }
    setCopied(true);
    onCopied?.(opp.item.name);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToManifest?.(opp);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const spriteUrl = `https://render.albiononline.com/v1/item/${opp.item.rawId}.png?quality=${opp.quality}`;

  const isSourceStale =
    opp.sourcePriceAge === 'Unknown' ||
    opp.sourcePriceAge.includes('d') ||
    (opp.sourcePriceAge.includes('h') && parseInt(opp.sourcePriceAge, 10) >= 12);
  const isDestStale =
    opp.destPriceAge === 'Unknown' ||
    opp.destPriceAge.includes('d') ||
    (opp.destPriceAge.includes('h') && parseInt(opp.destPriceAge, 10) >= 12);

  return (
    <div
      onClick={handleCopy}
      className={`group relative bg-[#121826] border rounded-xl p-3.5 sm:p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl cursor-pointer min-w-0 ${
        opp.isStarvation
          ? 'border-amber-500/60 shadow-md shadow-amber-500/10 hover:border-amber-400'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Starvation Banner */}
      {opp.isStarvation && (
        <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm z-10">
          <Flame className="h-3 w-3" />
          <span>Starvation Spike</span>
        </div>
      )}

      {/* Top Section: Item Image, Title, Badges */}
      <div className="flex items-start gap-3 mb-3">
        {/* Render Sprite */}
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-slate-950/80 border border-slate-800 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
          <img
            src={spriteUrl}
            alt={opp.item.name}
            className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-200"
            loading="lazy"
            onError={(e) => {
              // Fallback to flat item render if enchantment sprite fails
              (e.target as HTMLImageElement).src = `https://render.albiononline.com/v1/item/${opp.item.id}.png`;
            }}
          />
          <span
            className={`absolute bottom-0 right-0 text-[9px] sm:text-[10px] px-1 py-0.2 rounded-tl border-t border-l font-mono font-bold ${
              TIER_COLORS[opp.item.tier] || 'text-slate-300'
            }`}
          >
            T{opp.item.tier}.{opp.item.enchantment}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <h3 className="font-semibold text-slate-100 text-xs sm:text-sm truncate group-hover:text-amber-400 transition-colors">
              {opp.item.name}
            </h3>
            <button
              onClick={handleCopy}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-all flex-shrink-0"
              title="Copy name to clipboard"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>

          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span
              className={`text-[10px] sm:text-[11px] px-1.5 py-0.2 rounded border truncate ${
                QUALITY_COLORS[opp.quality] || 'text-slate-400 border-slate-700'
              }`}
            >
              {QUALITY_NAMES[opp.quality]}
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono text-slate-500 truncate">
              {opp.item.rawId}
            </span>
          </div>
        </div>
      </div>

      {/* Trade Flow: Source City -> Destination */}
      <div className="bg-slate-950/60 rounded-lg p-2 sm:p-2.5 border border-slate-800/80 mb-3 text-xs">
        <div className="flex items-center justify-between gap-1">
          {/* Source Buy */}
          <div className="min-w-0 flex-1">
            <div className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
              <span className="truncate">Buy {opp.sourceCity}</span>
              <span className={`font-mono text-[9px] px-1 py-0.2 rounded flex-shrink-0 ${isSourceStale ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-500'}`}>
                {opp.sourcePriceAge} {isSourceStale && '⚠️'}
              </span>
            </div>
            <div className="text-xs sm:text-sm font-bold font-mono text-slate-200 mt-0.5 truncate">
              {formatSilver(opp.sourceBuyPrice)}
            </div>
          </div>

          {/* Flow Arrow */}
          <div className="flex flex-col items-center px-1 text-slate-600 flex-shrink-0">
            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500/80" />
            <span className="text-[8px] sm:text-[9px] font-mono text-slate-500">Transport</span>
          </div>

          {/* Destination Sell */}
          <div className="min-w-0 flex-1 text-right">
            <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1 truncate">
              <span className="truncate">Sell {opp.destCity}</span>
              <span className={`font-mono text-[9px] px-1 py-0.2 rounded flex-shrink-0 ${isDestStale ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-500'}`}>
                {opp.destPriceAge} {isDestStale && '⚠️'}
              </span>
            </div>
            <div className="text-xs sm:text-sm font-bold font-mono text-emerald-400 mt-0.5 truncate">
              {formatSilver(opp.destSellPrice)}
            </div>
          </div>
        </div>
      </div>

      {/* Profit Footer */}
      <div className="flex items-center justify-between pt-2 sm:pt-2.5 border-t border-slate-800/70 text-xs gap-2">
        <div className="min-w-0">
          <span className="text-[10px] text-slate-400 block truncate">Net Profit</span>
          <span className="text-sm sm:text-base font-bold font-mono text-amber-400 truncate block">
            +{formatSilver(opp.netProfit)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span
            className={`text-xs font-bold font-mono px-2 py-1 rounded ${
              opp.roiPercentage >= 100
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-200'
            }`}
          >
            +{opp.roiPercentage}%
          </span>

          <button
            onClick={handleAdd}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium min-h-[34px] transition-all ${
              added
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                : 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Add to Transport Run Manifest"
          >
            {added ? <Check className="h-3 w-3 text-emerald-400" /> : <Plus className="h-3 w-3 text-amber-400" />}
            <span>{added ? 'Added' : 'Add Run'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
