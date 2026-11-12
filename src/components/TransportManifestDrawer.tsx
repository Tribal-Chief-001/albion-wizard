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
      manifestText += `- [${item.quantity}x] ${item.opp.item.name} (Q${item.opp.quality}) @ ${item.opp.sourceCity} for ${formatSilver(item.opp.sourceBuyPrice)} ea -> Sell ${item.opp.destCity} for ${formatSilver(item.opp.destSellPrice)} ea\n`;
    });
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(manifestText).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer docked to right viewport */}
      <div className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-[#121826] border-l border-slate-800 h-full flex flex-col shadow-2xl z-50">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Truck className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5 sm:gap-2 truncate">
                <span>Transport Run Manifest</span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono flex-shrink-0">
                  {totalItemsCount} items
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                Calculated Caerleon haul, weight & mount advisor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all min-w-[36px] min-h-[36px] flex items-center justify-center flex-shrink-0"
            title="Close Drawer"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto touch-scroll overscroll-y-contain p-3 sm:p-4 space-y-2.5 sm:space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 sm:p-8 text-slate-500 space-y-2">
              <Truck className="h-10 w-10 text-slate-700 stroke-[1.5]" />
              <p className="font-semibold text-slate-400 text-sm">Your Transport Cart is Empty</p>
              <p className="text-xs max-w-xs text-slate-500 leading-relaxed">
                Click "+ Add Run" on any arbitrage card in the scanner to build an optimal Caerleon delivery haul.
              </p>
            </div>
          ) : (
            items.map((item) => {
              const sprite = `https://render.albiononline.com/v1/item/${item.opp.item.rawId}.png?quality=${item.opp.quality}`;
              return (
                <div
                  key={`${item.opp.item.rawId}_${item.opp.quality}_${item.opp.sourceCity}`}
                  className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <img
                      src={sprite}
                      alt={item.opp.item.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://render.albiononline.com/v1/item/${item.opp.item.id}.png`;
                      }}
                      className="w-11 h-11 sm:w-12 sm:h-12 object-contain bg-slate-900 rounded border border-slate-800 p-0.5 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-200 truncate">{item.opp.item.name}</h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 truncate">
                        <span className="truncate">Buy: <strong className="text-slate-200">{item.opp.sourceCity}</strong></span>
                        <ArrowRight className="h-3 w-3 text-amber-500 flex-shrink-0" />
                        <span className="truncate">Sell: <strong className="text-emerald-400">{item.opp.destCity}</strong></span>
                      </div>
                      <div className="text-[11px] text-amber-400 font-mono mt-0.5 truncate">
                        Net: +{formatSilver(item.opp.netProfit * item.quantity)} ({item.opp.roiPercentage}% ROI)
                      </div>
                    </div>
                  </div>

                  {/* Quantity Controls & Remove */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                    <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1">
                      <button
                        onClick={() => onUpdateQuantity(item.opp.item.rawId, item.opp.quality, item.opp.sourceCity, -1)}
                        className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white min-w-[28px] min-h-[28px] flex items-center justify-center"
                        title="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="font-mono font-bold text-slate-200 px-1 text-xs min-w-[24px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.opp.item.rawId, item.opp.quality, item.opp.sourceCity, 1)}
                        className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white min-w-[28px] min-h-[28px] flex items-center justify-center"
                        title="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.opp.item.rawId, item.opp.quality, item.opp.sourceCity)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors min-w-[34px] min-h-[34px] flex items-center justify-center"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary & Action */}
        {items.length > 0 && (
          <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-900/90 space-y-2.5 sm:space-y-3 flex-shrink-0">
            {/* Mount & Logistics Advisor */}
            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xl flex-shrink-0">{mountIcon}</span>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Recommended Mount</span>
                  <span className="font-bold text-slate-200 truncate block">{recommendedMount}</span>
                </div>
              </div>
              <div className="text-left sm:text-right flex-shrink-0">
                <span className="text-[10px] text-slate-400 block">Estimated Weight</span>
                <span className="font-mono font-bold text-amber-400">~{totalWeightKg} kg</span>
              </div>
            </div>

            {/* Financial Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 min-w-0">
                <span className="text-[10px] text-slate-400 block truncate">Required Capital</span>
                <span className="font-bold font-mono text-slate-200 text-xs sm:text-sm truncate block">{formatSilver(totalCost)}</span>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-emerald-500/30 min-w-0">
                <span className="text-[10px] text-emerald-400 block truncate">Total Net Profit</span>
                <span className="font-bold font-mono text-emerald-400 text-xs sm:text-sm truncate block">+{formatSilver(totalNetProfit)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleExportManifest}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/10 min-h-[42px]"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Manifest Copied!' : 'Copy Full Manifest'}</span>
              </button>
              <button
                onClick={onClearAll}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all text-xs min-h-[42px] flex items-center justify-center"
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
