import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Cluster } from '../../types';
import {
  calculateWeibullProbability,
  getBanditState,
  BanditState,
  SERVER_SCHEDULES,
  ServerSchedule,
} from '../../data/factionData';
import { playBanditFanfare } from '../../utils/audio';
import {
  Clock,
  Volume2,
  VolumeX,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Radio,
  Server,
  Zap,
} from 'lucide-react';

interface BanditRadarProps {
  cluster: Cluster;
  audioEnabled?: boolean;
}

export const BanditRadar: React.FC<BanditRadarProps> = ({ cluster, audioEnabled = true }) => {
  // Elapsed time in minutes since previous event ended (default 225m = 3h 45m)
  const [elapsedMinutes, setElapsedMinutes] = useState<number>(225);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(!audioEnabled);

  // 15-minute countdown state
  const [isWarningActive, setIsWarningActive] = useState<boolean>(false);
  const [warningSecondsLeft, setWarningSecondsLeft] = useState<number>(15 * 60);

  // Bandit event active state
  const [isBanditActive, setIsBanditActive] = useState<boolean>(false);
  const [activeSecondsElapsed, setActiveSecondsElapsed] = useState<number>(0);

  // Live UTC Clock
  const [currentUtc, setCurrentUtc] = useState<Date>(new Date());

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Live UTC Clock ticking
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentUtc(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Sync audio mute prop
  useEffect(() => {
    setIsAudioMuted(!audioEnabled);
  }, [audioEnabled]);

  // 15m Countdown Interval
  useEffect(() => {
    if (isWarningActive) {
      timerRef.current = setInterval(() => {
        setWarningSecondsLeft((prev) => {
          if (prev <= 1) {
            // Transition to active
            setIsWarningActive(false);
            setIsBanditActive(true);
            setActiveSecondsElapsed(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isWarningActive]);

  // Active event elapsed timer (up to 60 mins)
  useEffect(() => {
    let activeInterval: ReturnType<typeof setInterval> | null = null;
    if (isBanditActive) {
      activeInterval = setInterval(() => {
        setActiveSecondsElapsed((prev) => {
          if (prev >= 60 * 60) {
            // Event concludes, reset to 0m elapsed cooldown
            setIsBanditActive(false);
            setElapsedMinutes(0);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (activeInterval) clearInterval(activeInterval);
    };
  }, [isBanditActive]);

  // Trigger manual 15m warning
  const handleTrigger15mWarning = useCallback(() => {
    setIsWarningActive(true);
    setIsBanditActive(false);
    setWarningSecondsLeft(15 * 60);
    if (!isAudioMuted) {
      playBanditFanfare();
    }
  }, [isAudioMuted]);

  // Cancel warning or reset active
  const handleResetRadar = useCallback(() => {
    setIsWarningActive(false);
    setIsBanditActive(false);
    setWarningSecondsLeft(15 * 60);
    setActiveSecondsElapsed(0);
  }, []);

  // Test Chime Fanfare
  const handleTestChime = useCallback(() => {
    playBanditFanfare();
  }, []);

  // Compute current Weibull probability
  const probability = useMemo(() => {
    return calculateWeibullProbability(elapsedMinutes);
  }, [elapsedMinutes]);

  const banditState: BanditState = useMemo(() => {
    return getBanditState(elapsedMinutes, isWarningActive, isBanditActive);
  }, [elapsedMinutes, isWarningActive, isBanditActive]);

  // Format MM:SS helper
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format Elapsed Hours & Minutes
  const formatHoursMins = (totalMins: number) => {
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  };

  // State styling metadata
  const stateConfig = useMemo(() => {
    switch (banditState) {
      case '15M_WARNING':
        return {
          title: '🚨 15-MINUTE ADVANCE WARNING',
          color: 'text-rose-400',
          borderColor: 'border-rose-500/50',
          bgBadge: 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse',
          arcStroke: '#f43f5e',
          description: 'Server broadcast spotted! Return to Royal City bank, gear up in 19k leech set, and wait at gate.',
        };
      case 'ACTIVE':
        return {
          title: '⚔️ BANDIT ASSAULT ACTIVE',
          color: 'text-emerald-400',
          borderColor: 'border-emerald-500/50',
          bgBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          arcStroke: '#10b981',
          description: 'Red Zone Outpost rush currently underway! Group up with your faction zerg and capture boss points.',
        };
      case 'LOCKED_COOLDOWN':
        return {
          title: 'LOCKED COOLDOWN (0% Hazard)',
          color: 'text-blue-400',
          borderColor: 'border-blue-500/40',
          bgBadge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          arcStroke: '#3b82f6',
          description: 'Server lockout active. Minimum 2.5 hours (150m) guaranteed between events. Zero chance of trigger.',
        };
      case 'ROLLING':
        return {
          title: 'ROLL WINDOW OPEN (Active Rolls)',
          color: 'text-amber-400',
          borderColor: 'border-amber-500/40',
          bgBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          arcStroke: '#f59e0b',
          description: 'Server hazard rolls executing every 15-30m. Probability escalating according to Weibull CDF.',
        };
      case 'HIGH_PROBABILITY':
        return {
          title: 'HIGH PROBABILITY (>47%)',
          color: 'text-orange-400',
          borderColor: 'border-orange-500/40',
          bgBadge: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
          arcStroke: '#f97316',
          description: 'Median window reached. Prepare faction bag, mount up, and scout Caerleon perimeter.',
        };
      case 'IMMINENT':
      default:
        return {
          title: 'IMMINENT / OVERDUE (>91%)',
          color: 'text-red-400',
          borderColor: 'border-red-500/50',
          bgBadge: 'bg-red-500/20 text-red-300 border-red-500/40',
          arcStroke: '#ef4444',
          description: 'Asymptotic roll limit approached. Event trigger expected at any moment.',
        };
    }
  }, [banditState]);

  // SVG Gauge calculations
  // Radius = 100, Circumference = 2 * PI * 100 = 628.32
  // We use a 240-degree arc (-210 deg to +30 deg)
  const radius = 95;
  const strokeWidth = 14;
  const arcLength = 2 * Math.PI * radius * 0.75; // 270 degrees arc
  const arcOffset = arcLength - (arcLength * (isWarningActive ? 1.0 : isBanditActive ? 1.0 : probability));

  // Current cluster schedule
  const activeSchedule = useMemo(() => {
    return SERVER_SCHEDULES.find((s) => s.cluster === cluster) || SERVER_SCHEDULES[0];
  }, [cluster]);

  // UTC time string
  const currentUtcString = currentUtc.toUTCString().split(' ')[4] || '00:00:00';

  // Calculate time until next maintenance
  const maintenanceCountdown = useMemo(() => {
    const nowUtcMins = currentUtc.getUTCHours() * 60 + currentUtc.getUTCMinutes();
    const maintMins = activeSchedule.maintenanceHourUtc * 60 + activeSchedule.maintenanceMinuteUtc;
    let diff = maintMins - nowUtcMins;
    if (diff < 0) diff += 24 * 60;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return `${h}h ${m}m`;
  }, [currentUtc, activeSchedule]);

  return (
    <div className="space-y-4 w-full min-w-0 max-w-full">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121826] border border-slate-800 p-3.5 sm:p-4 rounded-2xl">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Radio className="h-5 w-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 flex-wrap">
              <span>Bandit Assault Predictive Radar</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Weibull Hazard Engine
              </span>
            </h3>
            <p className="text-xs text-slate-400 truncate">
              Continuous probabilistic trigger modeling & 15m advance warning alerting
            </p>
          </div>
        </div>

        {/* Audio Fanfare Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              !isAudioMuted
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Fanfare Chime on 15m Warning"
          >
            {!isAudioMuted ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span>{!isAudioMuted ? 'Chime ON' : 'Muted'}</span>
          </button>

          <button
            onClick={handleTestChime}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-slate-300 hover:text-amber-300 hover:border-amber-500/40 transition-all"
            title="Preview 3-Stage Melodic Chime (587Hz -> 880Hz -> 1174Hz)"
          >
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>Test Chime</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Probability Arc & State Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full min-w-0">
        {/* Left Column (5 cols): Radial Visual Probability Arc */}
        <div className="lg:col-span-5 bg-[#121826] border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-between text-center min-w-0">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase text-slate-400 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              <span>Event Radar Gauge</span>
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${stateConfig.bgBadge}`}>
              {banditState.replace(/_/g, ' ')}
            </span>
          </div>

          {/* SVG Radial Arc */}
          <div className="relative w-52 h-52 sm:w-60 sm:h-60 my-2 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 220 220">
              {/* Background Arc */}
              <circle
                cx="110"
                cy="110"
                r={radius}
                fill="none"
                stroke="rgba(51, 65, 85, 0.4)"
                strokeWidth={strokeWidth}
                strokeDasharray={`${arcLength} 999`}
                strokeLinecap="round"
              />
              {/* Active Probability Arc */}
              <circle
                cx="110"
                cy="110"
                r={radius}
                fill="none"
                stroke={stateConfig.arcStroke}
                strokeWidth={strokeWidth}
                strokeDasharray={`${arcLength} 999`}
                strokeDashoffset={arcOffset}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />
            </svg>

            {/* Gauge Center Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
              {banditState === '15M_WARNING' ? (
                <>
                  <AlertTriangle className="h-7 w-7 text-rose-500 animate-bounce mb-1" />
                  <span className="text-3xl font-black font-mono text-rose-400 tracking-tight">
                    {formatTime(warningSecondsLeft)}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-rose-300 mt-0.5">
                    15M Warning Ticking
                  </span>
                </>
              ) : banditState === 'ACTIVE' ? (
                <>
                  <Zap className="h-7 w-7 text-emerald-400 animate-pulse mb-1" />
                  <span className="text-3xl font-black font-mono text-emerald-400 tracking-tight">
                    {formatTime(activeSecondsElapsed)}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-emerald-300 mt-0.5">
                    Bandit Active / 60m
                  </span>
                </>
              ) : (
                <>
                  <span className="text-4xl font-black font-mono tracking-tight text-white">
                    {(probability * 100).toFixed(1)}%
                  </span>
                  <span className="text-xs font-semibold text-slate-400 mt-0.5 uppercase tracking-wide">
                    Trigger Probability
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 mt-1">
                    {formatHoursMins(elapsedMinutes)} elapsed
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Quick Status Notice */}
          <p className="text-xs text-slate-400 mt-1 max-w-sm px-2">
            {stateConfig.description}
          </p>

          {/* Manual Advance Warning Action Button */}
          <div className="w-full mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row gap-2">
            {!isWarningActive && !isBanditActive ? (
              <button
                onClick={handleTrigger15mWarning}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-900/30 transition-all min-h-[40px]"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>15m Advance Warning Spotted!</span>
              </button>
            ) : (
              <button
                onClick={handleResetRadar}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all min-h-[38px]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset to Elapsed Simulation</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column (7 cols): Weibull Curve Dynamics & Elapsed Slider */}
        <div className="lg:col-span-7 space-y-4 min-w-0">
          {/* Interactive Elapsed Time Controls */}
          <div className="bg-[#121826] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <span>Elapsed Time Since Last Bandit Assault</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    t = {elapsedMinutes}m ({formatHoursMins(elapsedMinutes)})
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Drag the slider or click presets to inspect hazard progression.
                </p>
              </div>

              {/* Lockout status indicator */}
              <div className="flex items-center gap-1.5 text-xs font-mono self-start sm:self-auto flex-shrink-0">
                {elapsedMinutes < 150 ? (
                  <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30 text-[11px] flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    Lockout ({150 - elapsedMinutes}m left)
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px] flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    +{elapsedMinutes - 150}m Post-Lockout
                  </span>
                )}
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-1.5">
              <input
                type="range"
                min={0}
                max={360}
                step={5}
                value={elapsedMinutes}
                onChange={(e) => setElapsedMinutes(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0h (Ended)</span>
                <span className="text-blue-400 font-semibold">2h 30m (Lockout)</span>
                <span>3h 30m</span>
                <span className="text-amber-400 font-semibold">4h 15m (Median)</span>
                <span className="text-red-400 font-semibold">5h 30m (Overdue)</span>
                <span>6h 00m</span>
              </div>
            </div>

            {/* Quick Chips Presets */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono mr-1">Presets:</span>
              {[
                { label: 'Just Ended (0m)', val: 0 },
                { label: 'Lockout Ends (150m)', val: 150 },
                { label: '3h 30m (23.5%)', val: 210 },
                { label: '4h 00m (47.6%)', val: 240 },
                { label: '4h 15m (62.1%)', val: 255 },
                { label: '5h 00m (91.8%)', val: 300 },
                { label: '5h 30m (98.4%)', val: 330 },
              ].map((p) => (
                <button
                  key={p.val}
                  onClick={() => setElapsedMinutes(p.val)}
                  className={`px-2 py-1 rounded-md text-[11px] font-mono transition-all border ${
                    elapsedMinutes === p.val
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-semibold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Weibull Hazard Math Breakdown Table */}
          <div className="bg-[#121826] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h4 className="text-xs sm:text-sm font-bold text-white">
                Empirical Weibull Hazard Curve Table
              </h4>
              <span className="text-[10px] font-mono text-slate-500 truncate">
                F(t) = 1 - exp(-((t - 150) / 105)^2.4)
              </span>
            </div>

            <div className="overflow-x-auto no-scrollbar touch-scroll border border-slate-800/80 rounded-xl">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2 px-3">Elapsed</th>
                    <th className="py-2 px-3">&Delta;t Post-Lockout</th>
                    <th className="py-2 px-3">State</th>
                    <th className="py-2 px-3 text-right">Probability F(t)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  <tr className={elapsedMinutes <= 150 ? 'bg-blue-500/10 font-bold text-blue-300' : ''}>
                    <td className="py-1.5 px-3">0h - 2h 30m</td>
                    <td className="py-1.5 px-3">0 min</td>
                    <td className="py-1.5 px-3 text-blue-400">LOCKED_COOLDOWN</td>
                    <td className="py-1.5 px-3 text-right font-bold">0.0%</td>
                  </tr>
                  <tr className={elapsedMinutes > 150 && elapsedMinutes <= 180 ? 'bg-amber-500/10 font-bold text-amber-300' : ''}>
                    <td className="py-1.5 px-3">3h 00m</td>
                    <td className="py-1.5 px-3">30 min</td>
                    <td className="py-1.5 px-3 text-amber-400">ROLLING (Early)</td>
                    <td className="py-1.5 px-3 text-right">4.8%</td>
                  </tr>
                  <tr className={elapsedMinutes > 180 && elapsedMinutes <= 210 ? 'bg-amber-500/10 font-bold text-amber-300' : ''}>
                    <td className="py-1.5 px-3">3h 30m</td>
                    <td className="py-1.5 px-3">60 min</td>
                    <td className="py-1.5 px-3 text-amber-400">ROLLING</td>
                    <td className="py-1.5 px-3 text-right">23.5%</td>
                  </tr>
                  <tr className={elapsedMinutes > 210 && elapsedMinutes <= 240 ? 'bg-orange-500/10 font-bold text-orange-300' : ''}>
                    <td className="py-1.5 px-3">4h 00m</td>
                    <td className="py-1.5 px-3">90 min</td>
                    <td className="py-1.5 px-3 text-orange-400">MEDIAN WINDOW</td>
                    <td className="py-1.5 px-3 text-right">47.6%</td>
                  </tr>
                  <tr className={elapsedMinutes > 240 && elapsedMinutes <= 270 ? 'bg-orange-500/10 font-bold text-orange-300' : ''}>
                    <td className="py-1.5 px-3">4h 15m</td>
                    <td className="py-1.5 px-3">105 min (&lambda;)</td>
                    <td className="py-1.5 px-3 text-orange-400">HIGH_PROBABILITY</td>
                    <td className="py-1.5 px-3 text-right font-bold text-orange-400">62.1%</td>
                  </tr>
                  <tr className={elapsedMinutes > 270 && elapsedMinutes <= 300 ? 'bg-red-500/10 font-bold text-red-300' : ''}>
                    <td className="py-1.5 px-3">5h 00m</td>
                    <td className="py-1.5 px-3">150 min</td>
                    <td className="py-1.5 px-3 text-red-400">IMMINENT</td>
                    <td className="py-1.5 px-3 text-right font-bold text-red-400">91.8%</td>
                  </tr>
                  <tr className={elapsedMinutes > 300 ? 'bg-red-500/10 font-bold text-red-300' : ''}>
                    <td className="py-1.5 px-3">5h 30m+</td>
                    <td className="py-1.5 px-3">180 min</td>
                    <td className="py-1.5 px-3 text-red-400">OVERDUE</td>
                    <td className="py-1.5 px-3 text-right font-bold text-rose-400">98.4%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Server Maintenance Schedule Cards */}
      <div className="bg-[#121826] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-amber-400" />
            <h4 className="text-xs sm:text-sm font-bold text-white">
              Albion Online Regional Physical Server Schedules
            </h4>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-500">Live Server Clock:</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-300 font-bold">
              {currentUtcString} UTC
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SERVER_SCHEDULES.map((sched: ServerSchedule) => {
            const isCurrentCluster = sched.cluster === cluster;
            return (
              <div
                key={sched.cluster}
                className={`p-3.5 rounded-xl border transition-all ${
                  isCurrentCluster
                    ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-white">{sched.serverName}</span>
                  {isCurrentCluster && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-bold font-mono">
                      ACTIVE
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Daily Maintenance:</span>
                    <span className="font-mono text-amber-300 font-bold">{sched.maintenanceUtc}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Next Downtime In:</span>
                    <span className="font-mono text-slate-200">
                      {isCurrentCluster ? maintenanceCountdown : '~Scheduled'}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 mt-2 border-t border-slate-800/60 pt-2 leading-relaxed">
                  {sched.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Maintenance Invariant Callout */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-slate-300 mt-2">
          <ShieldCheck className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-blue-300">Daily Maintenance Invariant:</strong> Immediately upon server boot following daily maintenance, the Bandit timer resets to a guaranteed 2.5-hour (150m) lockout cooldown. Hazard rolls never execute during server maintenance or within the first 150 minutes post-restart.
          </div>
        </div>
      </div>
    </div>
  );
};
