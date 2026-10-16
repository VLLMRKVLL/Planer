import { AIRPORTS } from './airports';
import { requiresPassportControl } from './countries';
import {
  addMinutes,
  buildTimeline,
  getTimeSlot,
  minutesBetween,
  securityMinutesEndingAt,
} from './utils';

// Helper: crea una data locale a un certo orario (il giorno non conta)
const at = (hours: number, minutes = 0) => new Date(2026, 5, 1, hours, minutes);
// Formatta "HH:MM" per confronti leggibili
const hhmm = (d: Date) =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

describe('getTimeSlot', () => {
  it('returns earlyMorning before 8:00', () => {
    expect(getTimeSlot(at(5, 30))).toBe('earlyMorning');
    expect(getTimeSlot(at(7, 59))).toBe('earlyMorning');
  });

  it('returns day from 8:00 to 17:59', () => {
    expect(getTimeSlot(at(8))).toBe('day');
    expect(getTimeSlot(at(17, 59))).toBe('day');
  });

  it('returns evening at exactly 18:00', () => {
    expect(getTimeSlot(at(18))).toBe('evening');
  });
});

describe('requiresPassportControl', () => {
  it('is false for Schengen countries', () => {
    expect(requiresPassportControl('FR')).toBe(false);
    expect(requiresPassportControl('CH')).toBe(false); // non UE ma Schengen
  });

  it('is true for non-Schengen countries', () => {
    expect(requiresPassportControl('GB')).toBe(true);
    expect(requiresPassportControl('IE')).toBe(true); // UE ma non Schengen
  });

  it('ignores case and spaces', () => {
    expect(requiresPassportControl(' fr ')).toBe(false);
  });

  it('is true for unknown codes (prudent default)', () => {
    expect(requiresPassportControl('XX')).toBe(true);
  });
});

describe('addMinutes / minutesBetween', () => {
  it('adds minutes without mutating the input', () => {
    const start = at(23, 50);
    const end = addMinutes(start, 20);
    expect(hhmm(end)).toBe('00:10'); // passa la mezzanotte
    expect(hhmm(start)).toBe('23:50');
  });

  it('measures the minutes between two dates', () => {
    expect(minutesBetween(at(17, 45), at(18, 10))).toBe(25);
    expect(minutesBetween(at(18, 10), at(17, 45))).toBe(-25);
  });
});

describe('securityMinutesEndingAt', () => {
  const bgy = AIRPORTS.BGY.terminals[0]; // earlyMorning 35, day 25, evening 20

  it('uses the slot of the queue when start and end agree', () => {
    expect(securityMinutesEndingAt(at(12), bgy)).toBe(25);
  });

  it('keeps the longer queue across a slot boundary', () => {
    // Fine alle 8:20 (day, 25') → inizio stimato 7:55 (earlyMorning, 35')
    expect(securityMinutesEndingAt(at(8, 20), bgy)).toBe(35);
    // Fine alle 18:05 (evening, 20') → inizio stimato 17:45 (day, 25')
    expect(securityMinutesEndingAt(at(18, 5), bgy)).toBe(25);
  });
});

describe('buildTimeline', () => {
  it('chains the steps one after the other', () => {
    const timeline = buildTimeline(at(16, 45), [
      { id: 'travel', minutes: 20 },
      { id: 'bagDrop', minutes: 15 },
      { id: 'security', minutes: 15 },
      { id: 'walkToGate', minutes: 10 },
    ]);
    expect(timeline.map((s) => [s.id, hhmm(s.startAt), hhmm(s.endAt), s.minutes])).toEqual([
      ['travel', '16:45', '17:05', 20],
      ['bagDrop', '17:05', '17:20', 15],
      ['security', '17:20', '17:35', 15],
      ['walkToGate', '17:35', '17:45', 10],
    ]);
  });

  it('returns an empty timeline for no steps', () => {
    expect(buildTimeline(at(10), [])).toEqual([]);
  });
});
