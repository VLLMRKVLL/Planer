import { calculateTrip } from './calculateTrip';
import type { FlightInput } from './types';

const at = (hours: number, minutes = 0) => new Date(2026, 5, 1, hours, minutes);
// Formatta "HH:MM" per confronti leggibili
const hhmm = (d: Date) =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

describe('calculateTrip', () => {
  it('works backwards from the gate closing time', () => {
    const input: FlightInput = {
      airport: 'MXP',
      departureTime: at(10),
      destinationCountry: 'FR',
      hasCheckedBag: true,
      onlineCheckInDone: true,
      travelTimeMinutes: 60,
    };
    // default: gate chiude 30' prima; tappe 25+25+15+15 = 80' → 110' prima
    const plan = calculateTrip(input);
    expect(hhmm(plan.arriveAirportAt)).toBe('08:10');
    expect(hhmm(plan.leaveHomeAt)).toBe('07:10');
    expect(plan.bindingConstraint).toBe('gate');
  });

  it('skips bag drop and adds passport control when needed', () => {
    const plan = calculateTrip({
      airport: 'LIN',
      departureTime: at(18, 30),
      destinationCountry: 'GB',
      hasCheckedBag: false,
      onlineCheckInDone: true,
      travelTimeMinutes: 30,
      airline: 'ryanair',
    });
    expect(plan.steps.map((s) => s.id)).toEqual([
      'travel',
      'security',
      'passportControl',
      'walkToGate',
      'margin',
    ]);
    // 20' gate + 10+10+10+15 = 65' prima delle 18:30
    expect(hhmm(plan.arriveAirportAt)).toBe('17:25');
    expect(hhmm(plan.leaveHomeAt)).toBe('16:55');
  });

  it('uses the bag drop deadline when it is stricter', () => {
    const plan = calculateTrip({
      airport: 'LIN',
      departureTime: at(18, 30),
      destinationCountry: 'IT',
      hasCheckedBag: true,
      onlineCheckInDone: true,
      travelTimeMinutes: 20,
      airline: 'ita',
    });
    // gate: 20 + 50 = 70' → 17:20 ; banco: 60 + 15 = 75' → 17:15 (più prudente)
    expect(plan.bindingConstraint).toBe('bagDrop');
    expect(hhmm(plan.arriveAirportAt)).toBe('17:15');
  });

  it('requires bag drop when online check-in is not done', () => {
    const plan = calculateTrip({
      airport: 'BGY',
      departureTime: at(12),
      destinationCountry: 'ES',
      hasCheckedBag: false,
      onlineCheckInDone: false,
      travelTimeMinutes: 45,
    });
    expect(plan.steps.some((s) => s.id === 'bagDrop')).toBe(true);
  });
});
