import React from 'react';
import { ManifestItem } from '../types';
import { X, Trash2, Truck, Copy, Check, Plus, Minus, ArrowRight } from 'lucide-react';
import { formatSilver } from '../utils/quality';

interface TransportManifestDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: ManifestItem[];
  onUpdateQuantity: (rawId: string, quality: number, city: string, delta: number) => void;
  onRemoveItem: (rawId: string, quality: number, city: string) => void;
  onClearAll: () => void;
}

export const TransportManifestDrawer: React.FC<TransportManifestDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearAll,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const totalCost = items.reduce((sum, item) => sum + item.opp.sourceBuyPrice * item.quantity, 0);
  const totalNetProfit = items.reduce((sum, item) => sum + item.opp.netProfit * item.quantity, 0);
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Approximate weight: weapons/armors ~ 5-10kg each
  const totalWeightKg = items.reduce((sum, item) => {
    const baseWeight = item.opp.item.category.includes('weapons') ? 8 : 6;
    return sum + baseWeight * item.quantity;
  }, 0);

  // Mount Recommendation Logic
  let recommendedMount = 'Armored Horse (Fast & Safe)';
  let mountIcon = '🐴';
  if (totalWeightKg > 1500) {
    recommendedMount = 'Command Mammoth (Mass Guild Haul)';
    mountIcon = '🐘';
  } else if (totalWeightKg > 600) {
    recommendedMount = 'Grizzly Bear / T8 Transport Ox';
    mountIcon = '🐻';
  } else if (totalWeightKg > 150) {
    recommendedMount = 'Spectral Direboar / T6 Transport Ox';
    mountIcon = '🐗';
  }

  const handleExportManifest = () => {
    let manifestText = `=== ALBION WIZARD TRANSPORT MANIFEST ===\n`;
    manifestText += `Total Investment: ${formatSilver(totalCost)} | Net Profit: +${formatSilver(totalNetProfit)}\n`;
    manifestText += `Recommended Mount: ${recommendedMount} (~${totalWeightKg}kg)\n\n`;
    manifestText += `SHOPPING LIST:\n`;
    items.forEach((item) => {
      manifestText += `- [${item.quantity}x] ${item.opp.item.name} (Q${item.opp.quality}) @ ${item.opp.sourceCity} for ${formatSilver(item.opp.sourceBuyPrice)} ea -> Sell Black Market for ${formatSilver(item.opp.destSellPrice)} ea\n`;
    });
    navigator.clipboard.writeText(manifestText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121826] border-l border-slate-800 w-full max-w-xl h-full flex flex-col shadow-2xl relative">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Transport Run Manifest
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                  {totalItemsCount} items
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Calculated Caerleon haul, weight & mount advisor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-2">
              <Truck className="h-10 w-10 text-slate-700 stroke-[1.5]" />
              <p className="font-semibold text-slate-400 text-sm">Your Transport Cart is Empty</p>
              <p className="text-xs max-w-xs">
                Click "+ Add to Transport" on any arbitrage card in the scanner to build an optimal Caerleon delivery haul.
              </p>
            </div>
          ) : (
            items.map((item) => {
              const sprite = `https://render.albiononline.com/v1/item/${item.opp.item.rawId}.png?quality=${item.opp.quality}`;
              return (
                <div
                  key={`${item.opp.item.rawId}_${item.opp.quality}_${item.opp.sourceCity}`}
                  className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
                >
                  <img
                    src={sprite}
                    alt={item.opp.item.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://render.albiononline.com/v1/item/${item.opp.item.id}.png`;
                    }}
                    className="w-12 h-12 object-contain bg-slate-900 rounded border border-slate-800 p-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-200 truncate">{item.opp.item.name}</h4>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                      <span>Buy: <strong className="text-slate-200">{item.opp.sourceCity}</strong></span>
                      <ArrowRight className="h-3 w-3 text-amber-500" />
                      <span>Sell: <strong className="text-emerald-400">Black Market</strong></span>
                    </div>
                    <div className="text-[11px] text-amber-400 font-mono mt-0.5">
                      Net: +{formatSilver(item.opp.netProfit * item.quantity)} ({item.opp.roiPercentage}% ROI)
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1">
                    <button
                      onClick={() => onUpdateQuantity(item.opp.item.rawId, item.opp.quality, item.opp.sourceCity, -1)}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="font-mono font-bold text-slate-200 px-1 text-xs">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.opp.item.rawId, item.opp.quality, item.opp.sourceCity, 1)}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.opp.item.rawId, item.opp.quality, item.opp.sourceCity)}
                    className="p-1.5 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary & Action */}
        {items.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-900/90 space-y-3">
            {/* Mount & Logistics Advisor */}
            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-lg">{mountIcon}</span>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Recommended Mount</span>
                  <span className="font-bold text-slate-200">{recommendedMount}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Estimated Weight</span>
                <span className="font-mono font-bold text-amber-400">~{totalWeightKg} kg</span>
              </div>
            </div>

            {/* Financial Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Required Capital</span>
                <span className="font-bold font-mono text-slate-200 text-sm">{formatSilver(totalCost)}</span>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-emerald-500/30">
                <span className="text-[10px] text-emerald-400 block">Total Net Profit</span>
                <span className="font-bold font-mono text-emerald-400 text-sm">+{formatSilver(totalNetProfit)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleExportManifest}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/10"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Manifest Copied!' : 'Copy Full Manifest'}</span>
              </button>
              <button
                onClick={onClearAll}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all text-xs"
                title="Clear all items"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
