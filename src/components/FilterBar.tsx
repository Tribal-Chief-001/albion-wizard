import React from 'react';
import { FilterState, ItemCategory } from '../types';
import { Search, Flame, MapPin } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const CATEGORIES: { id: ItemCategory; label: string }[] = [
  { id: 'all', label: 'All Items' },
  { id: 'weapons_melee', label: 'Melee' },
  { id: 'weapons_ranged', label: 'Ranged' },
  { id: 'weapons_magic', label: 'Magic' },
  { id: 'armor_cloth', label: 'Cloth' },
  { id: 'armor_leather', label: 'Leather' },
  { id: 'armor_plate', label: 'Plate' },
  { id: 'bags_capes', label: 'Bags & Capes' },
];

const ROYAL_CITIES = ['All Cities', 'Martlock', 'Thetford', 'Fort Sterling', 'Lymhurst', 'Bridgewatch'];

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onChange }) => {
  const toggleTier = (tier: number) => {
    const exists = filters.tiers.includes(tier);
    const updated = exists ? filters.tiers.filter((t) => t !== tier) : [...filters.tiers, tier];
    onChange({ ...filters, tiers: updated });
  };

  const toggleEnchantment = (ench: number) => {
    const exists = filters.enchantments.includes(ench);
    const updated = exists ? filters.enchantments.filter((e) => e !== ench) : [...filters.enchantments, ench];
    onChange({ ...filters, enchantments: updated });
  };

  return (
    <div className="bg-[#121826] border border-slate-800 rounded-xl p-3 sm:p-4 space-y-3 sm:space-y-4 w-full max-w-full min-w-0 overflow-hidden">
      {/* Top Row: Search & Quick Toggles */}
      <div className="flex flex-col md:flex-row gap-2.5 sm:gap-3 items-stretch md:items-center justify-between w-full min-w-0">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search item name (e.g. Carving, Bloodletter, Robe, Bag)..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full pl-9 pr-4 py-2 sm:py-2.5 rounded-lg bg-slate-900 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 transition-all font-sans min-h-[40px]"
          />
        </div>

        {/* Source City Selector & Starvation Toggle */}
        <div className="flex items-center gap-2 w-full md:w-auto min-w-0">
          <div className="flex-1 sm:flex-initial flex items-center justify-between sm:justify-start gap-1.5 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-2 text-xs text-slate-300 min-h-[40px] min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
              <select
                value={filters.sourceCity === 'all' ? 'All Cities' : filters.sourceCity}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    sourceCity: e.target.value === 'All Cities' ? 'all' : e.target.value,
                  })
                }
                className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer pr-1 truncate"
              >
                {ROYAL_CITIES.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-slate-200">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Starvation Only Toggle */}
          <button
            onClick={() => onChange({ ...filters, starvationOnly: !filters.starvationOnly })}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border min-h-[40px] transition-all whitespace-nowrap ${
              filters.starvationOnly
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm shadow-amber-500/10'
                : 'bg-slate-900 border-slate-700/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className={`h-4 w-4 flex-shrink-0 ${filters.starvationOnly ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
            <span>Starvations Only</span>
          </button>
        </div>
      </div>

      {/* Middle Row: Categories (Scrollable track on mobile, wrapped on tablet/desktop) */}
      <div className="w-full max-w-full min-w-0 overflow-hidden border-t border-slate-800/80 pt-3">
        <div className="flex items-center sm:flex-wrap gap-1.5 overflow-x-auto no-scrollbar touch-scroll pb-0.5 w-full min-w-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onChange({ ...filters, category: cat.id })}
              className={`px-3 py-1.5 sm:py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap min-h-[34px] sm:min-h-[28px] flex items-center justify-center flex-shrink-0 ${
                filters.category === cat.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Row: Tiers, Enchantments, Sliders */}
      <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 border-t border-slate-800/80 pt-3 text-xs w-full min-w-0">
        {/* Tier Toggles */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px] uppercase font-semibold">Tiers:</span>
          <div className="flex items-center gap-1">
            {[4, 5, 6, 7, 8].map((t) => (
              <button
                key={t}
                onClick={() => toggleTier(t)}
                className={`w-8 h-8 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs transition-all border min-w-[32px] min-h-[32px] ${
                  filters.tiers.includes(t)
                    ? 'bg-slate-800 border-amber-400 text-amber-300 shadow-sm'
                    : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-400'
                }`}
              >
                T{t}
              </button>
            ))}
          </div>
        </div>

        {/* Enchantment Toggles */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px] uppercase font-semibold">Enchants:</span>
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3].map((e) => (
              <button
                key={e}
                onClick={() => toggleEnchantment(e)}
                className={`px-2.5 py-1.5 sm:px-2 sm:py-1 rounded-lg font-mono font-bold text-xs transition-all border min-w-[32px] min-h-[32px] flex items-center justify-center ${
                  filters.enchantments.includes(e)
                    ? 'bg-slate-800 border-emerald-400 text-emerald-300'
                    : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-400'
                }`}
              >
                .{e}
              </button>
            ))}
          </div>
        </div>

        {/* Thresholds: Min Profit, Min ROI, Max Age */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          {/* Min Profit */}
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-slate-400 text-[11px]">Min Profit:</span>
            <select
              value={filters.minProfit}
              onChange={(e) => onChange({ ...filters, minProfit: Number(e.target.value) })}
              className="bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1.5 text-xs text-amber-400 font-mono focus:outline-none min-h-[32px]"
            >
              <option value={0}>Any</option>
              <option value={25000}>25k+</option>
              <option value={50000}>50k+</option>
              <option value={100000}>100k+</option>
              <option value={250000}>250k+</option>
              <option value={500000}>500k+</option>
              <option value={1000000}>1M+</option>
            </select>
          </div>

          {/* Min ROI */}
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-slate-400 text-[11px]">Min ROI:</span>
            <select
              value={filters.minRoi}
              onChange={(e) => onChange({ ...filters, minRoi: Number(e.target.value) })}
              className="bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1.5 text-xs text-emerald-400 font-mono focus:outline-none min-h-[32px]"
            >
              <option value={10}>10%+</option>
              <option value={25}>25%+</option>
              <option value={50}>50%+</option>
              <option value={100}>100%+</option>
              <option value={150}>150%+</option>
              <option value={300}>300%+</option>
            </select>
          </div>

          {/* Max Age */}
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-slate-400 text-[11px]">Max Age:</span>
            <select
              value={filters.maxAgeHours}
              onChange={(e) => onChange({ ...filters, maxAgeHours: Number(e.target.value) })}
              className="bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none min-h-[32px]"
            >
              <option value={1}>&le; 1h</option>
              <option value={3}>&le; 3h</option>
              <option value={6}>&le; 6h</option>
              <option value={12}>&le; 12h</option>
              <option value={24}>&le; 24h</option>
              <option value={9999}>Any Age</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
