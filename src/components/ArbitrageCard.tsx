import React, { useState } from 'react';
import { ArbitrageOpportunity } from '../types';
import { Copy, Check, ArrowRight, Flame } from 'lucide-react';
import { formatSilver, QUALITY_COLORS, QUALITY_NAMES, TIER_COLORS } from '../utils/quality';

interface ArbitrageCardProps {
  opp: ArbitrageOpportunity;
}

export const ArbitrageCard: React.FC<ArbitrageCardProps> = ({ opp }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Copy the in-game search name (e.g. "Clarent Blade" or "T6 Clarent Blade")
    navigator.clipboard.writeText(opp.item.name);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const spriteUrl = `https://render.albiononline.com/v1/item/${opp.item.rawId}.png?quality=${opp.quality}`;

  return (
    <div
      onClick={handleCopy}
      className={`group relative bg-[#121826] border rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl cursor-pointer ${
        opp.isStarvation
          ? 'border-amber-500/60 shadow-md shadow-amber-500/10 hover:border-amber-400'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Starvation Banner */}
      {opp.isStarvation && (
        <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
          <Flame className="h-3 w-3" />
          <span>Starvation Spike</span>
        </div>
      )}

      {/* Top Section: Item Image, Title, Badges */}
      <div className="flex items-start gap-3.5 mb-3.5">
        {/* Render Sprite */}
        <div className="relative w-14 h-14 rounded-lg bg-slate-950/80 border border-slate-800 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
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
            className={`absolute bottom-0 right-0 text-[10px] px-1 py-0.2 rounded-tl border-t border-l font-mono font-bold ${
              TIER_COLORS[opp.item.tier] || 'text-slate-300'
            }`}
          >
            T{opp.item.tier}.{opp.item.enchantment}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-semibold text-slate-100 text-sm truncate group-hover:text-amber-400 transition-colors">
              {opp.item.name}
            </h3>
            <button
              onClick={handleCopy}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-all"
              title="Copy name to clipboard"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded border ${
                QUALITY_COLORS[opp.quality] || 'text-slate-400 border-slate-700'
              }`}
            >
              {QUALITY_NAMES[opp.quality]}
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              {opp.item.rawId}
            </span>
          </div>
        </div>
      </div>

      {/* Trade Flow: Source City -> Destination */}
      <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/80 mb-3 text-xs">
        <div className="flex items-center justify-between">
          {/* Source Buy */}
          <div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <span>Buy at {opp.sourceCity}</span>
              <span className="text-slate-500 font-mono">({opp.sourcePriceAge})</span>
            </div>
            <div className="text-sm font-bold font-mono text-slate-200 mt-0.5">
              {formatSilver(opp.sourceBuyPrice)}
            </div>
          </div>

          {/* Flow Arrow */}
          <div className="flex flex-col items-center px-2 text-slate-600">
            <ArrowRight className="h-4 w-4 text-amber-500/80" />
            <span className="text-[9px] font-mono text-slate-500">Transport</span>
          </div>

          {/* Destination Sell */}
          <div className="text-right">
            <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
              <span>Sell {opp.destCity}</span>
              <span className="text-slate-500 font-mono">({opp.destPriceAge})</span>
            </div>
            <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
              {formatSilver(opp.destSellPrice)}
            </div>
          </div>
        </div>
      </div>

      {/* Profit Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/70 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 block">Estimated Net Profit</span>
          <span className="text-base font-bold font-mono text-amber-400">
            +{formatSilver(opp.netProfit)}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block">ROI Spread</span>
          <span
            className={`text-sm font-bold font-mono px-2 py-0.5 rounded ${
              opp.roiPercentage >= 100
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-200'
            }`}
          >
            +{opp.roiPercentage}%
          </span>
        </div>
      </div>
    </div>
  );
};
