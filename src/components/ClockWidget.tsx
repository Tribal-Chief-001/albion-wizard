import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTimezone, TimezoneKey, TIMEZONE_OPTIONS } from '../context/TimezoneContext';
import { Clock, ChevronDown, Check, Globe, Server, Laptop } from 'lucide-react';

export const ClockWidget: React.FC = () => {
  const { currentTime, timezone, setTimezone, formatTime, formatDate, activeOption } = useTimezone();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  // Formatted values for active timezone
  const desktopTime = formatTime(currentTime, timezone, true); // HH:mm:ss
  const mobileTime = formatTime(currentTime, timezone, false);  // HH:mm (saves space on mobile)
  const activeDate = formatDate(currentTime, timezone);         // e.g. "Thu, Nov 12"

  // Select timezone and close
  const handleSelectTimezone = (key: TimezoneKey) => {
    setTimezone(key);
    setIsOpen(false);
  };

  // Icon helper based on timezone type
  const getTzIcon = (key: TimezoneKey) => {
    if (key === 'UTC') return <Server className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />;
    if (key === 'LOCAL') return <Laptop className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />;
    return <Globe className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />;
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left flex-shrink-0">
      {/* Clock Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={`Current Clock: ${desktopTime} (${activeOption.label}) - Click to switch timezone`}
        className={`group flex items-center min-h-[36px] rounded-lg border transition-all text-xs select-none ${
          isOpen
            ? 'bg-slate-900 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
            : 'bg-slate-900/90 border-slate-700/80 hover:border-amber-500/50 text-slate-200 hover:text-white'
        } px-2 sm:px-2.5 py-1`}
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

      {/* Dropdown Menu (Bloomberg Terminal Aesthetic) */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 top-full mt-1.5 w-72 sm:w-80 max-w-[calc(100vw-20px)] rounded-xl bg-[#0e131f] border border-slate-700/90 shadow-2xl shadow-black/80 backdrop-blur z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
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
                      {getTzIcon(opt.key)}
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

                  {/* Right side: Live clock in that timezone & selection indicator */}
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

          {/* Footer Informational Callout */}
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
    </div>
  );
};
