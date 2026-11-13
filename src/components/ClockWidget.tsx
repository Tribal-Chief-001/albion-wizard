import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTimezone, TimezoneKey, TIMEZONE_OPTIONS } from '../context/TimezoneContext';
import { Clock, ChevronDown, Check, Globe, Server, Laptop, X } from 'lucide-react';

export const ClockWidget: React.FC = () => {
  const { currentTime, timezone, setTimezone, formatTime, formatDate, activeOption } = useTimezone();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  // Desktop outside click handling & Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      // Desktop: close if clicked outside container
      if (window.innerWidth >= 768) {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  // Lock mobile body scroll when bottom sheet is open
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined' && window.innerWidth < 768) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Formatted values for active timezone
  const desktopTime = formatTime(currentTime, timezone, true); // HH:mm:ss
  const mobileTime = formatTime(currentTime, timezone, false);  // HH:mm (compact for mobile header)
  const activeDate = formatDate(currentTime, timezone);         // e.g. "Thu, Nov 12"

  // Select timezone and close
  const handleSelectTimezone = (key: TimezoneKey) => {
    setTimezone(key);
    setIsOpen(false);
  };

  // Icon helper based on timezone type
  const getTzIcon = (key: TimezoneKey, isSmall = false) => {
    const sizeCls = isSmall ? 'h-3.5 w-3.5' : 'h-4 w-4';
    if (key === 'UTC') return <Server className={`${sizeCls} text-amber-400 flex-shrink-0`} />;
    if (key === 'LOCAL') return <Laptop className={`${sizeCls} text-blue-400 flex-shrink-0`} />;
    return <Globe className={`${sizeCls} text-emerald-400 flex-shrink-0`} />;
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left flex-shrink-0">
      {/* Clock Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        title={`Current Clock: ${desktopTime} (${activeOption.label}) - Tap to change timezone`}
        className={`group flex items-center min-h-[32px] sm:min-h-[36px] rounded-lg border transition-all text-xs select-none active:scale-[0.98] ${
          isOpen
            ? 'bg-slate-900 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
            : 'bg-slate-900/90 border-slate-700/80 hover:border-amber-500/50 text-slate-200 hover:text-white'
        } px-1.5 sm:px-2.5 py-1`}
      >
        {/* Mobile View (< md): Ultra-compact pill strictly engineered to prevent header blowout */}
        <div className="flex md:hidden items-center gap-1 font-mono">
          <Clock className="h-3 w-3 text-amber-400 animate-pulse flex-shrink-0" />
          <span className="font-bold text-slate-100 tracking-tight text-[11px] tabular-nums">
            {mobileTime}
          </span>
          <span className="px-1 py-0.2 rounded text-[9px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
            {activeOption.shortLabel}
          </span>
          <ChevronDown
            className={`h-2.5 w-2.5 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-amber-400' : ''
            }`}
          />
        </div>

        {/* Desktop View (md+): Bloomberg Monospace Live Clock & Date */}
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-amber-400 transition-colors">
            <Clock className="h-3.5 w-3.5 text-amber-400 animate-pulse flex-shrink-0" />
          </div>

          {/* Monospace Ticking Digits */}
          <div className="flex flex-col text-left leading-none font-mono">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-100 tracking-wider text-xs tabular-nums">
                {desktopTime}
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                {activeOption.shortLabel}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 font-sans truncate">
              {activeDate}
            </span>
          </div>

          <ChevronDown
            className={`h-3 w-3 text-slate-400 group-hover:text-amber-300 transition-transform duration-200 ml-0.5 ${
              isOpen ? 'rotate-180 text-amber-400' : ''
            }`}
          />
        </div>
      </button>

      {/* ========================================================================= */}
      {/* 1. DESKTOP DROPDOWN (md+): Anchored below the button                      */}
      {/* ========================================================================= */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="hidden md:block absolute right-0 top-full mt-1.5 w-80 rounded-xl bg-[#0e131f] border border-slate-700/90 shadow-2xl shadow-black/80 backdrop-blur z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">
                Timezone Telemetry
              </span>
            </div>
            <span className="text-[10px] font-mono text-amber-400/80 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
              Live Ticks (1s)
            </span>
          </div>

          {/* Timezone List */}
          <div className="p-1.5 space-y-1 max-h-[70vh] overflow-y-auto no-scrollbar">
            {TIMEZONE_OPTIONS.map((opt) => {
              const isSelected = opt.key === timezone;
              const optTime = formatTime(currentTime, opt.key, true);
              const optDate = formatDate(currentTime, opt.key);

              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleSelectTimezone(opt.key)}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-sm'
                      : 'bg-slate-900/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/70 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="mt-0.5 flex-shrink-0">
                      {getTzIcon(opt.key, true)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-100 truncate">
                          {opt.label}
                        </span>
                        <span
                          className={`text-[9px] font-mono font-semibold px-1 py-0.2 rounded uppercase ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {opt.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {opt.sublabel}
                      </p>
                    </div>
                  </div>

                  {/* Right: Converted time & checkmark */}
                  <div className="flex items-center gap-2 flex-shrink-0 text-right font-mono">
                    <div>
                      <div className="text-xs font-bold text-slate-200 tabular-nums">
                        {optTime}
                      </div>
                      <div className="text-[9px] text-slate-500">
                        {optDate}
                      </div>
                    </div>
                    <div className="w-4 flex items-center justify-center">
                      {isSelected && <Check className="h-4 w-4 text-amber-400" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer Callout */}
          <div className="px-3 py-2 bg-slate-950/80 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
            <span className="truncate">
              Synchronizes Bandit Radar & Maintenance
            </span>
            <span className="font-mono text-slate-500 text-[9px] ml-2 flex-shrink-0">
              ESC to close
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MOBILE BOTTOM SHEET MODAL (< md): Rendered via React Portal            */}
      {/* Completely immune to header overflow clipping and touch-bubbling bugs    */}
      {/* ========================================================================= */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] md:hidden flex flex-col justify-end">
          {/* Dark Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Bottom Sheet Card */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-tz-title"
            className="relative z-10 w-full max-h-[85vh] bg-[#0e131f] border-t border-slate-700/90 rounded-t-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
          >
            {/* Grab Handle */}
            <div className="pt-2.5 pb-1 flex justify-center">
              <div className="w-12 h-1 bg-slate-600 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-400" />
                <span id="mobile-tz-title" className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200">
                  Select Timezone
                </span>
                <span className="text-[10px] font-mono text-amber-400/90 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  Live
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/60 active:bg-slate-700 transition-colors"
                aria-label="Close timezone selector"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Timezone List with large touch targets */}
            <div className="p-3 space-y-2 overflow-y-auto max-h-[60vh] overscroll-contain">
              {TIMEZONE_OPTIONS.map((opt) => {
                const isSelected = opt.key === timezone;
                const optTime = formatTime(currentTime, opt.key, true);
                const optDate = formatDate(currentTime, opt.key);

                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleSelectTimezone(opt.key)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 min-h-[54px] active:scale-[0.99] ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-white shadow-md shadow-amber-500/10'
                        : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-800/80 active:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${isSelected ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
                        {getTzIcon(opt.key, false)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                            {opt.label}
                          </span>
                          <span
                            className={`text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded uppercase flex-shrink-0 ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950 font-bold'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {opt.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {opt.sublabel}
                        </p>
                      </div>
                    </div>

                    {/* Right side: Live clock & selection indicator */}
                    <div className="flex items-center gap-2.5 flex-shrink-0 text-right font-mono">
                      <div>
                        <div className={`text-xs sm:text-sm font-bold tabular-nums ${isSelected ? 'text-amber-300 font-extrabold' : 'text-slate-200'}`}>
                          {optTime}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {optDate}
                        </div>
                      </div>
                      <div className="w-5 flex items-center justify-center flex-shrink-0">
                        {isSelected && <Check className="h-5 w-5 text-amber-400 font-bold" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-slate-950/95 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between pb-4">
              <span className="truncate pr-2">
                Syncs Bandit Radar, Reset Clocks & Wartime
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-amber-400 hover:text-amber-300 font-medium px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 flex-shrink-0"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
