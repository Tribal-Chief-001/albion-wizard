import React, { useState } from 'react';
import {
  LEECH_LOADOUT,
  LeechLoadoutItem,
} from '../../data/factionData';
import { formatSilver } from '../../utils/quality';
import {
  Shield,
  Copy,
  Check,
  Zap,
  Footprints,
  EyeOff,
  Flame,
  Sparkles,
} from 'lucide-react';

export const LeechPlaybook: React.FC = () => {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [activeEscapeStep, setActiveEscapeStep] = useState<number>(1);

  // Total cost calculations
  const totalWithHorse = LEECH_LOADOUT.reduce((acc, i) => acc + i.costSilver, 0);
  const totalWithMule = totalWithHorse - 7000 + 1200; // replace 7k horse with 1.2k mule = ~19.5k

  // Copy Loadout text for Discord / Guild Notes
  const handleCopyText = (type: 'discord' | 'market') => {
    let text = '';
    if (type === 'discord') {
      text = `🛡️ ALBION WIZARD: 19K ZERO-SPEC LEECH LOADOUT (<20k Silver)\n` +
        `--------------------------------------------------\n` +
        `• Main Hand: 4.0 Double-Bladed Staff (Q Cartwheel, W Stun Run, E Soaring Swipe)\n` +
        `• Armor: 4.0 Assassin Jacket (R Ambush - 8s Stealth)\n` +
        `• Shoes: 4.0 Miner Boots (F Flee - 120% MS + CC Immunity)\n` +
        `• Head: 4.0 Mage Cowl (D Poison - 20m Tag)\n` +
        `• Cape: T3 / T4 Regular Cape\n` +
        `• Mount: T3 Riding Horse (or T2/T3 Mule for 19k budget)\n` +
        `• Consumables: 1x T4 Invis Potion + 1x T7 Catfish\n` +
        `Total Cost: ~${(totalWithMule).toLocaleString()} Silver (Mule) / ~${(totalWithHorse).toLocaleString()} Silver (Horse)\n` +
        `Tactics: Tag boss with Poison D at 30% HP from 20m, immediately remount A, sit outside circle!`;
    } else {
      text = `Double-Bladed Staff\nAssassin Jacket\nMiner Boots\nMage Cowl\nCape\nRiding Horse\nInvisibility Potion\nCatfish`;
    }

    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  return (
    <div className="space-y-4 w-full min-w-0 max-w-full">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121826] border border-slate-800 p-3.5 sm:p-4 rounded-2xl">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <Shield className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 flex-wrap">
              <span>Un-Gankable 19k Solo Leech Playbook</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                0-Spec Beginner Meta
              </span>
            </h3>
            <p className="text-xs text-slate-400 truncate">
              Budget loadout bill of materials, 1-tick boss assist rule & 5-step escape chain
            </p>
          </div>
        </div>

        {/* 1-Click Copy Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
          <button
            onClick={() => handleCopyText('discord')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25 transition-all"
            title="Copy formatted loadout for Discord, Guild, or notes"
          >
            {copiedType === 'discord' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedType === 'discord' ? 'Copied Guide!' : 'Copy Discord Build'}</span>
          </button>

          <button
            onClick={() => handleCopyText('market')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-slate-300 hover:text-white transition-all"
            title="Copy clean item names for market search"
          >
            {copiedType === 'market' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>Item Names</span>
          </button>
        </div>
      </div>

      {/* Loadout Bill of Materials & Cost Breakdown */}
      <div className="bg-[#121826] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3.5 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <span>Bill of Materials: 4.0 Ultra-Budget Solo Loadout</span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                {formatSilver(totalWithMule)} (Mule) / {formatSilver(totalWithHorse)} (Horse)
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Zero combat mastery required. Pure disengagement and mobility mechanics.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            100% Full Loot Survivability
          </span>
        </div>

        {/* Loadout Table */}
        <div className="overflow-x-auto no-scrollbar touch-scroll border border-slate-800/80 rounded-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Slot</th>
                <th className="py-2.5 px-3">Item Name</th>
                <th className="py-2.5 px-3">Tier</th>
                <th className="py-2.5 px-3 text-right">Market Cost</th>
                <th className="py-2.5 px-3">Key Ability</th>
                <th className="py-2.5 px-3">Tactical Escape Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-300">
              {LEECH_LOADOUT.map((item: LeechLoadoutItem) => (
                <tr key={item.slot} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-2 px-3 text-slate-400 font-medium">{item.slot}</td>
                  <td className="py-2 px-3 text-white font-bold">{item.item}</td>
                  <td className="py-2 px-3 text-slate-400">{item.tier}</td>
                  <td className="py-2 px-3 text-right text-amber-300 font-mono">
                    {formatSilver(item.costSilver)}
                  </td>
                  <td className="py-2 px-3 text-emerald-400 font-semibold">{item.abilityName}</td>
                  <td className="py-2 px-3 text-slate-400 text-[11px]">{item.tacticalRole}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Layout: 1-Tick Rule & 1.5-Screen Buffer vs 5-Step Escape Chain */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full min-w-0">
        {/* Left Column (6 cols): 1-Tick Poison Rule & 1.5-Screen Leech Buffer */}
        <div className="lg:col-span-6 bg-[#121826] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 min-w-0">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Flame className="h-5 w-5 text-amber-400" />
            <div>
              <h4 className="text-sm font-bold text-white">The 1-Tick Poison Assist Rule</h4>
              <p className="text-[11px] text-slate-400">100% full outpost FP reward with 0 risk</p>
            </div>
          </div>

          <div className="space-y-3 text-xs leading-relaxed text-slate-300">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <strong className="text-amber-300 block mb-1">How Albion Point Credit Works:</strong>
              Faction Outpost capture rewards are not scaled by DPS or damage dealt. Dealing <strong>exactly 1 tick of damage</strong> to the Outpost Champion registers you as an active combatant, granting 100% of the base 1,000–3,450 Faction Points when the outpost flips!
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <strong className="text-white block">The 4-Step Outpost Protocol:</strong>
              <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
                <li>Stay mounted at the perimeter while the 50-man allied zerg pulls the Champion.</li>
                <li>Wait until the Champion drops to ~30% HP (all enemy defenders cleared).</li>
                <li>Dismount at 18–20m range, cast <strong>Mage Cowl Poison (D)</strong>.</li>
                <li>Immediately press your mount hotkey (<code className="text-amber-300 bg-slate-800 px-1 rounded">A</code> key, 3s cast) and wait mounted outside the circle.</li>
              </ol>
            </div>
          </div>

          {/* 1.5-Screen Leech Buffer Visual Diagram */}
          <div className="border border-slate-800 rounded-xl p-3 bg-slate-900/80 space-y-2 text-xs">
            <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
              Positioning Geometry: The 1.5-Screen Leech Buffer
            </span>

            {/* Visual Box Diagram */}
            <div className="space-y-1.5 font-mono text-[11px]">
              {/* Front line */}
              <div className="p-2 rounded bg-rose-950/40 border border-rose-500/40 text-rose-300 text-center">
                Front Vanguard & Tanks (High Casualty Bomb Zone &bull; NEVER GO HERE)
              </div>
              {/* Distance arrow */}
              <div className="text-center text-slate-600">&darr; 20 meters &darr;</div>
              {/* Main Blob */}
              <div className="p-2 rounded bg-amber-950/30 border border-amber-500/40 text-amber-300 text-center">
                Main 50-Man Faction Blob (AoE Escalation Danger Clump)
              </div>
              {/* Distance arrow */}
              <div className="text-center text-slate-500 font-bold">&darr; 1.5 Screens Distance (~35-45m) &darr;</div>
              {/* Leech Buffer */}
              <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-center font-bold shadow-sm shadow-emerald-500/20">
                🛡️ THE LEECH BUFFER PERIMETER (Mounted, Trailing Behind, Safe Gallop Ready)
              </div>
            </div>

            <p className="text-[10px] text-slate-500 leading-normal mt-1">
              *AoE Escalation: Spells deal +8% damage per player hit (up to +100%). Sitting inside the capture circle makes you collateral damage to enemy bomb squads.
            </p>
          </div>
        </div>

        {/* Right Column (6 cols): 5-Step Escape Chain Interactive Flowchart */}
        <div className="lg:col-span-6 bg-[#121826] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 min-w-0">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Footprints className="h-5 w-5 text-emerald-400" />
            <div>
              <h4 className="text-sm font-bold text-white">5-Step Deterministic Escape Chain</h4>
              <p className="text-[11px] text-slate-400">Click steps below to rehearse anti-gank muscle memory</p>
            </div>
          </div>

          {/* Interactive Steps */}
          <div className="space-y-2">
            {[
              {
                step: 1,
                title: 'Step 1: Press R (Assassin Jacket Ambush)',
                icon: EyeOff,
                badge: '8s Stealth',
                color: 'text-amber-400',
                detail: 'Immediately grants full invisibility for up to 8 seconds. Drop mob aggro and player lock. Walk at a 90° angle away from the road into thick forest brush.',
              },
              {
                step: 2,
                title: 'Step 2: Drink T4 Invisibility Potion',
                icon: Sparkles,
                badge: '4.5s Stealth Layer',
                color: 'text-purple-400',
                detail: 'If gankers spray wide AoE spells near your path, drink your invis potion. Provides an emergency secondary stealth layer without breaking stride.',
              },
              {
                step: 3,
                title: 'Step 3: Activate F (Miner Boots Flee)',
                icon: Zap,
                badge: '+120% MS + CC Immune',
                color: 'text-emerald-400',
                detail: 'Flee grants +120% movement speed for 5 seconds and makes you 100% immune to all stuns, roots, silences, and slows. Distance yourself rapidly.',
              },
              {
                step: 4,
                title: 'Step 4: Weapon Mobility Jump (E + W)',
                icon: Footprints,
                badge: '15m - 19m Leap',
                color: 'text-blue-400',
                detail: 'Cast Double-Bladed E (Soaring Swipe) or Bloodletter E + Dash. Leap over choke points, cliff ledges, or resource nodes to break line-of-sight.',
              },
              {
                step: 5,
                title: 'Step 5: Drop Aggro & Remount',
                icon: Shield,
                badge: '3s Remount Cast',
                color: 'text-emerald-300',
                detail: 'After 5 seconds out of combat, press A to mount your horse (3s cast). Gallop at 80% speed straight to the nearest safe-zone gate.',
              },
            ].map((s) => {
              const isCurrent = activeEscapeStep === s.step;
              const StepIcon = s.icon;

              return (
                <div
                  key={s.step}
                  onClick={() => setActiveEscapeStep(s.step)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-slate-900 border-amber-500/80 shadow-md shadow-amber-500/10'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-6 w-6 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${
                          isCurrent ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {s.step}
                      </div>
                      <StepIcon className={`h-4 w-4 ${s.color}`} />
                      <span className={`text-xs font-bold ${isCurrent ? 'text-white' : 'text-slate-300'}`}>
                        {s.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {s.badge}
                    </span>
                  </div>

                  {isCurrent && (
                    <p className="text-xs text-slate-300 mt-2 pl-8 leading-relaxed animate-in fade-in duration-200">
                      {s.detail}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Stepper Navigation */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <button
              onClick={() => setActiveEscapeStep((prev) => Math.max(1, prev - 1))}
              disabled={activeEscapeStep === 1}
              className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-all"
            >
              Previous Step
            </button>
            <span className="font-mono text-slate-500 text-[11px]">
              Step {activeEscapeStep} of 5
            </span>
            <button
              onClick={() => setActiveEscapeStep((prev) => Math.min(5, prev + 1))}
              disabled={activeEscapeStep === 5}
              className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-500/30 transition-all font-semibold"
            >
              Next Step
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
