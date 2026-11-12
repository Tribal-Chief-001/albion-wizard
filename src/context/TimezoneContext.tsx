import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

export type TimezoneKey = 'UTC' | 'LOCAL' | 'America/New_York' | 'Europe/Berlin' | 'Asia/Singapore';

export interface TimezoneOption {
  key: TimezoneKey;
  label: string;
  sublabel: string;
  shortLabel: string;
  badge: string;
  description: string;
  ianaTimezone?: string;
}

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  {
    key: 'UTC',
    label: 'UTC (Albion Server)',
    sublabel: 'Official Server Time',
    shortLabel: 'UTC',
    badge: 'ALBION',
    description: 'Universal Coordinated Time - Albion Online native server clock',
    ianaTimezone: 'UTC',
  },
  {
    key: 'LOCAL',
    label: 'Local Browser Time',
    sublabel: 'Your Device Timezone',
    shortLabel: 'LOC',
    badge: 'BROWSER',
    description: 'System timezone detected from your browser environment',
    ianaTimezone: undefined,
  },
  {
    key: 'America/New_York',
    label: 'Americas Hub (New York)',
    sublabel: 'US East / Washington DC',
    shortLabel: 'EST',
    badge: 'US/NY',
    description: 'Americas (West) Cluster server population & prime-time hub',
    ianaTimezone: 'America/New_York',
  },
  {
    key: 'Europe/Berlin',
    label: 'Europe Hub (Berlin/Amsterdam)',
    sublabel: 'Western Europe / CET',
    shortLabel: 'CET',
    badge: 'EU/BER',
    description: 'Europe Cluster physical host (Amsterdam) & continental EU hub',
    ianaTimezone: 'Europe/Berlin',
  },
  {
    key: 'Asia/Singapore',
    label: 'Asia Hub (Singapore)',
    sublabel: 'Southeast Asia / SGT',
    shortLabel: 'SGT',
    badge: 'ASIA/SG',
    description: 'Asia (East) Cluster physical host (Singapore) prime-time hub',
    ianaTimezone: 'Asia/Singapore',
  },
];

export interface ConvertedTzTime {
  formatted: string;         // e.g. "14:30"
  formattedWithTz: string;   // e.g. "14:30 EST (+1d)"
  hour: number;              // 14
  minute: number;            // 30
  dayOffset: number;         // -1, 0, or 1
  offsetLabel: string;       // "-1d", "", "+1d"
  tzCode: string;            // "EST/EDT", "UTC", etc.
}

/**
 * Formats a Date object in a given timezone to 24-hour HH:mm[:ss] format.
 */
export function formatTime(
  date: Date = new Date(),
  tz: TimezoneKey = 'UTC',
  includeSeconds: boolean = true
): string {
  try {
    const tzOption = tz === 'LOCAL' ? undefined : tz;
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: tzOption,
      hour: '2-digit',
      minute: '2-digit',
      ...(includeSeconds ? { second: '2-digit' } : {}),
      hour12: false,
    }).format(date);
  } catch (err) {
    console.warn(`[TimezoneContext] Error formatting time for tz ${tz}:`, err);
    return date.toUTCString().slice(17, includeSeconds ? 25 : 22);
  }
}

/**
 * Formats a Date object into a readable date string (e.g. "Thu, 12 Nov").
 */
export function formatDate(
  date: Date = new Date(),
  tz: TimezoneKey = 'UTC'
): string {
  try {
    const tzOption = tz === 'LOCAL' ? undefined : tz;
    return new Intl.DateTimeFormat('en-US', {
      timeZone: tzOption,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch (err) {
    console.warn(`[TimezoneContext] Error formatting date for tz ${tz}:`, err);
    return date.toDateString();
  }
}

/**
 * Converts a UTC hour:minute (e.g., server maintenance or bandit window)
 * into the target timezone, returning day offset (+1d, -1d, 0) and formatted strings.
 */
export function convertUtcToTz(
  utcHour: number,
  utcMinute: number,
  tz: TimezoneKey = 'UTC',
  referenceDate: Date = new Date()
): ConvertedTzTime {
  try {
    const utcEpoch = Date.UTC(
      referenceDate.getUTCFullYear(),
      referenceDate.getUTCMonth(),
      referenceDate.getUTCDate(),
      utcHour,
      utcMinute,
      0,
      0
    );
    const targetDate = new Date(utcEpoch);
    const tzOption = tz === 'LOCAL' ? undefined : tz;

    const targetParts = new Intl.DateTimeFormat('en-GB', {
      timeZone: tzOption,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(targetDate);

    const utcParts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(targetDate);

    const targetMap = Object.fromEntries(targetParts.map((p) => [p.type, p.value]));
    const utcMap = Object.fromEntries(utcParts.map((p) => [p.type, p.value]));

    const targetHour = parseInt(targetMap.hour, 10);
    const targetMinute = parseInt(targetMap.minute, 10);

    const utcDateStr = `${utcMap.year}-${utcMap.month}-${utcMap.day}`;
    const targetDateStr = `${targetMap.year}-${targetMap.month}-${targetMap.day}`;

    const diffMs = Date.parse(`${targetDateStr}T00:00:00Z`) - Date.parse(`${utcDateStr}T00:00:00Z`);
    const dayOffset = Math.round(diffMs / (24 * 60 * 60 * 1000));

    const offsetLabel = dayOffset > 0 ? `+${dayOffset}d` : dayOffset < 0 ? `${dayOffset}d` : '';
    const formatted = `${targetMap.hour}:${targetMap.minute}`;
    const tzCode = TIMEZONE_OPTIONS.find((o) => o.key === tz)?.shortLabel || tz;
    const formattedWithTz = `${formatted} ${tzCode}${offsetLabel ? ` (${offsetLabel})` : ''}`;

    return {
      formatted,
      formattedWithTz,
      hour: targetHour,
      minute: targetMinute,
      dayOffset,
      offsetLabel,
      tzCode,
    };
  } catch (err) {
    console.warn(`[TimezoneContext] Error converting UTC to ${tz}:`, err);
    const fallbackHour = utcHour.toString().padStart(2, '0');
    const fallbackMin = utcMinute.toString().padStart(2, '0');
    return {
      formatted: `${fallbackHour}:${fallbackMin}`,
      formattedWithTz: `${fallbackHour}:${fallbackMin} UTC`,
      hour: utcHour,
      minute: utcMinute,
      dayOffset: 0,
      offsetLabel: '',
      tzCode: 'UTC',
    };
  }
}

export interface TimezoneContextType {
  currentTime: Date;
  timezone: TimezoneKey;
  setTimezone: (tz: TimezoneKey) => void;
  formatTime: (date?: Date, tz?: TimezoneKey, includeSeconds?: boolean) => string;
  formatDate: (date?: Date, tz?: TimezoneKey) => string;
  convertUtcToTz: (utcHour: number, utcMinute: number, tz?: TimezoneKey, referenceDate?: Date) => ConvertedTzTime;
  activeOption: TimezoneOption;
  options: TimezoneOption[];
}

const STORAGE_KEY = 'albion_wizard_tz';

const TimezoneContext = createContext<TimezoneContextType | undefined>(undefined);

export const TimezoneProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  const [timezone, setTimezoneState] = useState<TimezoneKey>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && TIMEZONE_OPTIONS.some((o) => o.key === saved)) {
        return saved as TimezoneKey;
      }
    } catch (e) {
      console.warn('Failed to load timezone from localStorage:', e);
    }
    return 'UTC';
  });

  // Ticks every 1000ms
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const setTimezone = useCallback((tz: TimezoneKey) => {
    setTimezoneState(tz);
    try {
      localStorage.setItem(STORAGE_KEY, tz);
    } catch (e) {
      console.warn('Failed to save timezone to localStorage:', e);
    }
  }, []);

  const activeOption = useMemo(() => {
    return TIMEZONE_OPTIONS.find((o) => o.key === timezone) || TIMEZONE_OPTIONS[0];
  }, [timezone]);

  // Context-aware formatTime bound to active timezone if omitted
  const contextFormatTime = useCallback(
    (date?: Date, tz?: TimezoneKey, includeSeconds?: boolean) => {
      return formatTime(date || currentTime, tz || timezone, includeSeconds);
    },
    [currentTime, timezone]
  );

  // Context-aware formatDate bound to active timezone if omitted
  const contextFormatDate = useCallback(
    (date?: Date, tz?: TimezoneKey) => {
      return formatDate(date || currentTime, tz || timezone);
    },
    [currentTime, timezone]
  );

  // Context-aware convertUtcToTz bound to active timezone if omitted
  const contextConvertUtcToTz = useCallback(
    (utcHour: number, utcMinute: number, tz?: TimezoneKey, referenceDate?: Date) => {
      return convertUtcToTz(utcHour, utcMinute, tz || timezone, referenceDate || currentTime);
    },
    [timezone, currentTime]
  );

  const value = useMemo<TimezoneContextType>(
    () => ({
      currentTime,
      timezone,
      setTimezone,
      formatTime: contextFormatTime,
      formatDate: contextFormatDate,
      convertUtcToTz: contextConvertUtcToTz,
      activeOption,
      options: TIMEZONE_OPTIONS,
    }),
    [currentTime, timezone, setTimezone, contextFormatTime, contextFormatDate, contextConvertUtcToTz, activeOption]
  );

  return <TimezoneContext.Provider value={value}>{children}</TimezoneContext.Provider>;
};

export const useTimezone = (): TimezoneContextType => {
  const context = useContext(TimezoneContext);
  if (!context) {
    throw new Error('useTimezone must be used within a TimezoneProvider');
  }
  return context;
};
