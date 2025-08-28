export type SupportedRange = '1h' | '6h' | '24h' | '3d' | '7d' | '30d';

export interface TimeWindow {
  from: number; // epoch ms
  to: number;   // epoch ms (now)
  label: string;
}

const HOURS = 60 * 60 * 1000;
const DAYS = 24 * HOURS;

export function parseRange(range: SupportedRange, now: number = Date.now()): TimeWindow {
  switch (range) {
    case '1h':
      return { from: now - 1 * HOURS, to: now, label: 'last 1 hour' };
    case '6h':
      return { from: now - 6 * HOURS, to: now, label: 'last 6 hours' };
    case '24h':
      return { from: now - 24 * HOURS, to: now, label: 'last 24 hours' };
    case '3d':
      return { from: now - 3 * DAYS, to: now, label: 'last 3 days' };
    case '7d':
      return { from: now - 7 * DAYS, to: now, label: 'last 7 days' };
    case '30d':
      return { from: now - 30 * DAYS, to: now, label: 'last 30 days' };
    default:
      // Exhaustive check
      throw new Error(`Unsupported range: ${range}`);
  }
}


