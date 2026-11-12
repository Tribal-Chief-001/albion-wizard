import React, { useState, useMemo } from 'react';
import { Cluster } from '../../types';
import {
  SMUGGLER_CONTRACTS,
  SmugglerContract,
  SMUGGLER_MOUNTS,
  SmugglerMount,
  CITY_HEARTS,
} from '../../data/factionData';
import { formatSilver } from '../../utils/quality';
import {
  Truck,
  ShieldCheck,
  AlertTriangle,
  Compass,
  Skull,
  Percent,
  CheckCircle,
} from 'lucide-react';

interface SmugglerRoutePlannerProps {
  cluster: Cluster;
}

export const SmugglerRoutePlanner: React.FC<SmugglerRoutePlannerProps> = ({ cluster }) => {
  const [selectedContractId, setSelectedContractId] = useState<string>('major_safe');
  const [selectedMountId, setSelectedMountId] = useState<string>('saddled_wild_boar');
  const [survivalProbability, setSurvivalProbability] = useState<number>(85); // 85% default

  // Average heart price for calculations
  const heartPrice = useMemo(() => {
    const prices = CITY_HEARTS.map((h) => h.marketPrices[cluster] || 32000);
    return prices.reduce((a, b) => a + b, 0) / prices.length;
  }, [cluster]);

  const selectedContract = useMemo(() => {
    return SMUGGLER_CONTRACTS.find((c) => c.id === selectedContractId) || SMUGGLER_CONTRACTS[2];
  }, [selectedContractId]);

  const selectedMount = useMemo(() => {
    return SMUGGLER_MOUNTS.find((m) => m.id === selectedMountId) || SMUGGLER_MOUNTS[3];
  }, [selectedMountId]);

  // Red Zone Game Theory Calculations:
  // Success payout: +12 hearts * heartPrice - minor mission fee
  const redSuccessPayout = 12 * heartPrice - 10000;
  // Catastrophe loss: 15 collateral hearts + 180k gear + 140k mount
  const redLossCatastrophe = 15 * heartPrice + 180000 + 140000;
  // Break-even P = Loss / (Success + Loss)
  const breakEvenP = (redLossCatastrophe / (redSuccessPayout + redLossCatastrophe)) * 100;

  // Expected Value based on user's survival probability slider
  const userP = survivalProbability / 100;
  const expectedValueRedRun = userP * redSuccessPayout - (1 - userP) * redLossCatastrophe;

  // Safe run guaranteed profit
  const safeRunProfit = selectedContract.netHeartProfit * heartPrice;
  const safeSilverPerMin = safeRunProfit / selectedContract.avgTimeMin;

  // Mount net silver/min adjustment based on speed multiplier
  // Base 100% speed reference: 75% gallop
  const speedRatio = selectedMount.gallopSpeed / 80;
  const adjustedTripDurationMin = Math.max(5, selectedContract.avgTimeMin / speedRatio);
  const adjustedSpM = selectedContract.type === 'safe'
    ? safeRunProfit / adjustedTripDurationMin
    : expectedValueRedRun / adjustedTripDurationMin;

  return (
    <div className="space-y-4 w-full min-w-0 max-w-full">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121826] border border-slate-800 p-3.5 sm:p-4 rounded-2xl">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Truck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 flex-wrap">
              <span>Faction Smuggler Route & Cargo Planner</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                100% Safe Zone Invariant
              </span>
            </h3>
            <p className="text-xs text-slate-400 truncate">
              Deterministic heart transport optimizer, mount physics & Red Zone game theory EV engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 self-start sm:self-auto flex-shrink-0">
          <span>Avg Heart:</span>
          <span className="text-amber-300 font-bold">{formatSilver(heartPrice)}</span>
        </div>
      </div>

      {/* Contract Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {SMUGGLER_CONTRACTS.map((contract: SmugglerContract) => {
          const isSelected = contract.id === selectedContractId;
          const isRed = contract.type === 'red';
          const netSilver = contract.netHeartProfit * heartPrice;

          return (
            <div
              key={contract.id}
              onClick={() => setSelectedContractId(contract.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? isRed
                    ? 'bg-rose-950/30 border-rose-500 shadow-lg shadow-rose-950/20'
                    : 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10'
                  : 'bg-[#121826] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      isRed
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {isRed ? 'Lethal Red Zone' : '100% Safe Route'}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {contract.collateralHearts} &rarr; {contract.rewardHearts} Hearts
                  </span>
                </div>

                <h4 className="font-bold text-sm text-white">{contract.name}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {contract.riskDescription}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-mono">
                    Net Profit
                  </span>
                  <span
                    className={`font-mono font-bold text-sm ${
                      isRed ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    +{formatSilver(netSilver)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase block font-mono">
                    Trip Time
                  </span>
                  <span className="font-mono text-xs text-slate-300 font-semibold">
                    ~{contract.avgTimeMin} mins
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Analysis Grid: Safe Invariant vs Red Zone Game Theory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full min-w-0">
        {/* Left Column (6 cols): 100% Safe Zone Invariant Rules */}
        <div className="lg:col-span-6 bg-[#121826] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3.5 min-w-0">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div>
              <h4 className="text-sm font-bold text-white">The 100% Safe-Zone Invariant</h4>
              <p className="text-[11px] text-slate-400">Blue (T4) and Yellow (T5) territory rules</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-slate-300">
              <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-300">Full-Loot Death is Physically Impossible:</strong> In Blue and Yellow zones, hostile faction combat can only inflict a 3-minute knockout. You never drop your inventory.
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
              <CheckCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300">Heart Crate Drop Immunity:</strong> Faction Smuggler Crates are bound to mission inventory and cannot be looted, destroyed, or stolen by other players in safe zones.
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
              <CheckCircle className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-blue-300">Trivial Durability Penalty:</strong> A knockdown causes 10% durability loss on equipped gear. On standard 4.0 armor, repair costs are ~1,200 silver against a guaranteed profit of +135,000 to +150,000 silver (+112x upside).
              </div>
            </div>
          </div>

          {/* Safe Route Profit Summary */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Safe Major (15 &rarr; 18 Hearts):</span>
            <span className="text-emerald-400 font-bold">
              +{formatSilver(3 * heartPrice)} Silver / 16 min (~{Math.round(safeSilverPerMin).toLocaleString()} SpM)
            </span>
          </div>
        </div>

        {/* Right Column (6 cols): Red Zone Game Theory & Break-Even Threshold */}
        <div className="lg:col-span-6 bg-[#121826] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3.5 min-w-0">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Skull className="h-5 w-5 text-rose-400" />
            <div>
              <h4 className="text-sm font-bold text-white">Red Zone Smuggling Game Theory</h4>
              <p className="text-[11px] text-slate-400">
                15 &rarr; 27 Hearts (+12 Hearts Net) Mathematical Risk/Reward
              </p>
            </div>
          </div>

          {/* Interactive Survival Rate Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Percent className="h-3.5 w-3.5 text-amber-400" />
                <span>Estimated Survival Rate (P):</span>
              </span>
              <span
                className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                  survivalProbability >= breakEvenP
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {survivalProbability}% {survivalProbability >= breakEvenP ? '(+EV Positive)' : '(-EV Drain)'}
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={survivalProbability}
              onChange={(e) => setSurvivalProbability(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />

            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0% (Dead)</span>
              <span className="text-rose-400 font-bold">Break-Even ({breakEvenP.toFixed(1)}%)</span>
              <span className="text-emerald-400 font-bold">100% (Clean)</span>
            </div>
          </div>

          {/* Mathematical Payoff Metrics */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Success Payout (&Pi;)</span>
              <span className="text-emerald-400 font-bold text-sm">
                +{formatSilver(redSuccessPayout)}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Failure Loss (L)</span>
              <span className="text-rose-400 font-bold text-sm">
                -{formatSilver(redLossCatastrophe)}
              </span>
            </div>
          </div>

          {/* Expected Value Result */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono ${
              expectedValueRedRun >= 0
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
            }`}
          >
            <span>Expected Value (EV / Run):</span>
            <span className="font-bold text-sm">
              {expectedValueRedRun >= 0 ? '+' : ''}
              {formatSilver(expectedValueRedRun)} Silver
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            <strong>Break-Even Threshold Formula:</strong> Survival rate must exceed <strong>{breakEvenP.toFixed(2)}%</strong>. If your route passes through active gank chokes where survival falls below {breakEvenP.toFixed(1)}%, safe-zone hauling is strictly superior.
          </p>
        </div>
      </div>

      {/* Mount Selector & Tactical Specs */}
      <div className="bg-[#121826] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <Compass className="h-4 w-4 text-amber-400" />
              <span>Smuggler Transport Mount Physics & Speeds</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Select your transport beast to inspect gallop speeds, carry mechanism, and net silver/minute.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            Selected: {selectedMount.name} ({selectedMount.tier})
          </span>
        </div>

        {/* Mount Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {SMUGGLER_MOUNTS.map((mount: SmugglerMount) => {
            const isSelected = mount.id === selectedMountId;

            return (
              <div
                key={mount.id}
                onClick={() => setSelectedMountId(mount.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                      {mount.tier}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                        mount.escapeRating === 'S-Tier'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : mount.escapeRating === 'A-Tier'
                          ? 'bg-blue-500/20 text-blue-300'
                          : mount.escapeRating === 'F-Tier'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {mount.escapeRating} Escape
                    </span>
                  </div>

                  <h5 className="font-bold text-xs text-white">{mount.name}</h5>
                  <div className="text-[11px] font-mono text-slate-400 mt-1 space-y-0.5">
                    <div>Gallop: <span className="text-slate-200 font-semibold">{mount.gallopSpeed}%</span></div>
                    <div>Capacity: <span className="text-slate-200 font-semibold">{mount.carryCapacityKg > 0 ? `${mount.carryCapacityKg} kg` : 'Base Player'}</span></div>
                    <div className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">
                      {mount.mechanism === 'passive_courier' ? (
                        <span className="text-emerald-400">Passive Courier</span>
                      ) : (
                        <span className="text-rose-400 font-bold">Mount-Bound</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-amber-300 font-bold">
                  ~{mount.silverPerMinScore.toLocaleString()} SpM Score
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Mount Tactical Notes & Trip Speed Calculator */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
          <div className="md:col-span-8 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <span className="font-bold text-amber-300 block mb-1">
              Tactical Overview: {selectedMount.name}
            </span>
            {selectedMount.tacticalNotes}
          </div>

          <div className="md:col-span-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between text-xs font-mono">
            <span className="text-[10px] text-slate-500 uppercase">Estimated Trip Duration</span>
            <div className="text-lg font-black text-white">
              ~{adjustedTripDurationMin.toFixed(1)} mins
            </div>
            <span className="text-[11px] text-emerald-400 font-bold">
              ~{Math.round(adjustedSpM).toLocaleString()} Silver/min
            </span>
          </div>
        </div>

        {/* Urgent Warning: Ox Overburden Death Trap */}
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/40 text-xs text-slate-300 leading-relaxed">
          <AlertTriangle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-rose-300">CRITICAL SAFETY INVARIANT: The Transport Ox Overburden Death Trap:</strong>
            <p className="mt-1 text-slate-400">
              An Ox provides enormous carry capacity, but that bonus is <em>strictly mount-bound</em>. If hostile gankers dismount you in a Red Zone, your carry capacity instantly collapses down to your character base (~80kg). You become <strong>800% overloaded</strong>, moving at 0.1 m/s, unable to cast mobility spells or drink potions. <strong>Never use an Ox in Red Zones.</strong> Always use a <em>Saddled Wild Boar</em> or <em>Grizzly Bear</em> whose Passive Courier weight capacity stays 100% active when dismounted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
