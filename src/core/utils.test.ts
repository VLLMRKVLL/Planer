import { getTimeSlot, requiresPassportControl } from './utils';

// Helper: crea una data locale a un certo orario (il giorno non conta)
const at = (hours: number, minutes = 0) => new Date(2026, 5, 1, hours, minutes);

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
});
