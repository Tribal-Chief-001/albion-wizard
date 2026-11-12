import React, { useState } from 'react';
import { X, ShieldAlert, HelpCircle } from 'lucide-react';
import { formatSilver } from '../utils/quality';

interface FactionMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FactionHeart {
  city: string;
  heartName: string;
  itemId: string;
  pointsCost: number;
  avgMarketValue: number; // typical spread value
}

const FACTION_HEARTS: FactionHeart[] = [
  { city: 'Lymhurst', heartName: 'Treeheart', itemId: 'QUESTITEM_TOKEN_FOREST', pointsCost: 3000, avgMarketValue: 46000 },
  { city: 'Fort Sterling', heartName: 'Mountain Heart', itemId: 'QUESTITEM_TOKEN_HIGHLAND', pointsCost: 3000, avgMarketValue: 47500 },
  { city: 'Martlock', heartName: 'Rockheart', itemId: 'QUESTITEM_TOKEN_STEPPE', pointsCost: 3000, avgMarketValue: 44000 },
  { city: 'Thetford', heartName: 'Vineheart', itemId: 'QUESTITEM_TOKEN_SWAMP', pointsCost: 3000, avgMarketValue: 45000 },
  { city: 'Bridgewatch', heartName: 'Beastheart', itemId: 'QUESTITEM_TOKEN_MOUNTAIN', pointsCost: 3000, avgMarketValue: 46500 },
];

export const FactionMatrixModal: React.FC<FactionMatrixModalProps> = ({ isOpen, onClose }) => {
  const [pointsInput, setPointsInput] = useState<number>(30000);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121826] border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Faction Point Arbitrage Matrix
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-normal border border-blue-500/30">
                System 1 (0 Risk)
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Safe-Zone Point-to-Heart deterministic conversion multiplier
            </p>
          </div>
        </div>

        {/* Informational Alert */}
        <div className="bg-blue-950/40 border border-blue-800/60 rounded-xl p-3.5 mb-5 text-xs text-blue-200 flex items-start gap-2.5">
          <HelpCircle className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-blue-300">Never buy Faction Chests!</span> Faction Chests are weighted with RNG fame books and silver bags with an average value of only 8–10 Silver per point. Buying <strong>Faction Hearts</strong> guarantees an average yield of <strong>15 to 22 Silver per point</strong>.
          </div>
        </div>

        {/* Input: Faction Points */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6">
          <label className="text-xs text-slate-400 block mb-1.5 font-medium">
            Enter your current Faction Points:
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={3000}
              step={1000}
              value={pointsInput}
              onChange={(e) => setPointsInput(Math.max(0, Number(e.target.value)))}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-base font-mono font-bold text-amber-400 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => setPointsInput(100000)}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-mono"
            >
              100k
            </button>
            <button
              onClick={() => setPointsInput(250000)}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-mono"
            >
              250k
            </button>
          </div>
        </div>

        {/* Conversion Cards */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Optimal Conversion Targets ({Math.floor(pointsInput / 3000)} Hearts Redeemable)
          </h3>

          {FACTION_HEARTS.map((heart) => {
            const heartsPurchasable = Math.floor(pointsInput / heart.pointsCost);
            const totalSilverValue = heartsPurchasable * heart.avgMarketValue;
            const silverPerPoint = (heart.avgMarketValue / heart.pointsCost).toFixed(2);

            return (
              <div
                key={heart.city}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition-all text-xs"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={`https://render.albiononline.com/v1/item/${heart.itemId}.png`}
                    alt={heart.heartName}
                    className="w-10 h-10 object-contain rounded bg-slate-900 border border-slate-800 p-0.5"
                  />
                  <div>
                    <span className="font-bold text-white block text-sm">{heart.heartName}</span>
                    <span className="text-[11px] text-slate-400">
                      City: <strong className="text-slate-200">{heart.city}</strong> (Cost: {heart.pointsCost.toLocaleString()} pts)
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-emerald-400 block">
                    ~{formatSilver(totalSilverValue)} Silver
                  </span>
                  <span className="text-[11px] font-mono text-amber-400/90">
                    {silverPerPoint} Silver / pt
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
