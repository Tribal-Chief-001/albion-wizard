export const QUALITY_NAMES: Record<number, string> = {
  1: 'Normal',
  2: 'Good',
  3: 'Outstanding',
  4: 'Excellent',
  5: 'Masterpiece',
};

export const QUALITY_COLORS: Record<number, string> = {
  1: 'text-slate-400 border-slate-700 bg-slate-800/40',
  2: 'text-emerald-400 border-emerald-700/50 bg-emerald-950/30',
  3: 'text-blue-400 border-blue-700/50 bg-blue-950/30',
  4: 'text-purple-400 border-purple-700/50 bg-purple-950/30',
  5: 'text-amber-300 border-amber-600/70 bg-amber-950/40 font-semibold',
};

export const TIER_COLORS: Record<number, string> = {
  4: 'border-blue-500/60 bg-blue-950/40 text-blue-400',
  5: 'border-red-500/60 bg-red-950/40 text-red-400',
  6: 'border-orange-500/60 bg-orange-950/40 text-orange-400',
  7: 'border-amber-400/60 bg-amber-950/40 text-amber-300',
  8: 'border-slate-200/80 bg-slate-800/60 text-slate-100 font-bold',
};

export function formatSilver(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(2)}M`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(1)}k`;
  }
  return amount.toLocaleString();
}
