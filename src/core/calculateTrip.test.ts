import { calculateTrip } from './calculateTrip';
import type { TripPlan } from './types';

const at = (hours: number, minutes = 0) => new Date(2026, 5, 1, hours, minutes);
// Formatta "HH:MM" per confronti leggibili
const hhmm = (d: Date) =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

// Timeline come righe [id, inizio, fine] per confronti leggibili
const rows = (plan: TripPlan) => plan.timeline.map((s) => [s.id, hhmm(s.startAt), hhmm(s.endAt)]);
const minutesOf = (plan: TripPlan, id: string) => plan.timeline.find((s) => s.id === id)?.minutes;

// Proprietà che ogni piano deve rispettare, qualunque sia l'input
function expectConsistentTimeline(plan: TripPlan) {
  const { timeline } = plan;
  // Parte da casa e arriva in aeroporto agli orari dichiarati
  expect(timeline[0].id).toBe('travel');
  expect(timeline[0].startAt).toEqual(plan.leaveHomeAt);
  expect(timeline[0].endAt).toEqual(plan.arriveAirportAt);
  // Nessun buco: ogni tappa inizia dove finisce la precedente
  for (let i = 1; i < timeline.length; i++) {
    expect(timeline[i].startAt).toEqual(timeline[i - 1].endAt);
  }
  // Finisce con il buffer, esattamente alla chiusura del gate
  const last = timeline[timeline.length - 1];
  expect(last.id).toBe('buffer');
  expect(last.endAt).toEqual(plan.deadlines.find((d) => d.id === 'gateClose')?.at);
}

describe('calculateTrip', () => {
  it('works backwards from the gate closing time', () => {
    const plan = calculateTrip({
      airport: 'MXP',
      departureTime: at(10),
      destinationCountry: 'FR',
      hasCheckedBag: true,
      onlineCheckInDone: true,
      travelTimeMinutes: 60,
    });
    // default: gate chiude alle 9:30, margine 15' → al gate alle 9:15
    // cammino 15' → controlli 8:35–9:00 (day, 25') → banco 25' → arrivo 8:10
    expect(hhmm(plan.arriveAirportAt)).toBe('08:10');
    expect(hhmm(plan.leaveHomeAt)).toBe('07:10');
    expect(plan.bindingConstraint).toBe('gate');
    expect(plan.terminal).toBe('T1');
    expect(rows(plan)).toEqual([
      ['travel', '07:10', '08:10'],
      ['bagDrop', '08:10', '08:35'],
      ['security', '08:35', '09:00'],
      ['walkToGate', '09:00', '09:15'],
      ['buffer', '09:15', '09:30'],
    ]);
    expectConsistentTimeline(plan);
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
    expect(plan.timeline.map((s) => s.id)).toEqual([
      'travel',
      'security',
      'passportControl',
      'walkToGate',
      'buffer',
    ]);
    // gate 18:10 − 15' margine − 10' cammino − 10' passaporti → controlli finiti alle 17:35
    // controlli 15' (day) → arrivo 17:20
    expect(hhmm(plan.arriveAirportAt)).toBe('17:20');
    expect(hhmm(plan.leaveHomeAt)).toBe('16:50');
    // Senza bagaglio non c'è la scadenza del banco
    expect(plan.deadlines.map((d) => d.id)).toEqual(['gateClose', 'departure']);
    expectConsistentTimeline(plan);
  });

  it('uses the security slot of the queue, not of the flight', () => {
    // Volo serale (18:30) ma coda alle 17:20 → fascia day (15'), non evening (10')
    const plan = calculateTrip({
      airport: 'LIN',
      departureTime: at(18, 30),
      destinationCountry: 'FR',
      hasCheckedBag: false,
      onlineCheckInDone: true,
      travelTimeMinutes: 30,
      airline: 'ryanair',
    });
    expect(minutesOf(plan, 'security')).toBe(15);
  });

  it('keeps the longer queue when security crosses a slot boundary', () => {
    const plan = calculateTrip({
      airport: 'BGY',
      departureTime: at(9, 15),
      destinationCountry: 'FR',
      hasCheckedBag: false,
      onlineCheckInDone: true,
      travelTimeMinutes: 30,
    });
    // gate 8:45 − 15' − 10' cammino → controlli finiti alle 8:20 (day, 25')
    // ma iniziati prima delle 8 (earlyMorning, 35'): si tiene 35' → arrivo 7:45
    expect(minutesOf(plan, 'security')).toBe(35);
    expect(hhmm(plan.arriveAirportAt)).toBe('07:45');
    expectConsistentTimeline(plan);
  });

  it('uses the bag drop deadline (with its margin) when it is stricter', () => {
    const plan = calculateTrip({
      airport: 'LIN',
      departureTime: at(18, 30),
      destinationCountry: 'IT',
      hasCheckedBag: true,
      onlineCheckInDone: true,
      travelTimeMinutes: 20,
      airline: 'ita',
    });
    // gate: 18:10 − 15' − 10' − 15' − 15' → 17:15
    // banco: chiude 17:30 − 10' margine − 15' coda → 17:05 (più prudente)
    expect(plan.bindingConstraint).toBe('bagDrop');
    expect(hhmm(plan.arriveAirportAt)).toBe('17:05');
    const bagDrop = plan.timeline.find((s) => s.id === 'bagDrop');
    expect(hhmm(bagDrop!.endAt)).toBe('17:20'); // 10' prima della chiusura del banco
    expect(plan.deadlines.map((d) => [d.id, hhmm(d.at)])).toEqual([
      ['bagDropClose', '17:30'],
      ['gateClose', '18:10'],
      ['departure', '18:30'],
    ]);
    expectConsistentTimeline(plan);
  });

  it('puts the extra time in the buffer when the bag drop wins', () => {
    const plan = calculateTrip({
      airport: 'LIN',
      departureTime: at(18, 30),
      destinationCountry: 'IT',
      hasCheckedBag: true,
      onlineCheckInDone: true,
      travelTimeMinutes: 20,
      airline: 'ita',
    });
    // Al gate alle 17:45, chiude alle 18:10 → 25' liberi (15' di margine + 10' extra)
    expect(minutesOf(plan, 'buffer')).toBe(25);
  });

  it('leaves exactly the gate margin as buffer when the gate wins', () => {
    const plan = calculateTrip({
      airport: 'MXP',
      departureTime: at(10),
      destinationCountry: 'FR',
      hasCheckedBag: true,
      onlineCheckInDone: true,
      travelTimeMinutes: 60,
    });
    expect(plan.bindingConstraint).toBe('gate');
    expect(minutesOf(plan, 'buffer')).toBe(15);
  });

  it('accepts custom margins', () => {
    const plan = calculateTrip(
      {
        airport: 'LIN',
        departureTime: at(18, 30),
        destinationCountry: 'GB',
        hasCheckedBag: false,
        onlineCheckInDone: true,
        travelTimeMinutes: 30,
        airline: 'ryanair',
      },
      { gate: 0, bagDrop: 0 },
    );
    // Senza margine si arriva al gate esattamente alla chiusura (18:10)
    expect(hhmm(plan.arriveAirportAt)).toBe('17:35');
    expect(minutesOf(plan, 'buffer')).toBe(0);
    expectConsistentTimeline(plan);
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
    expect(plan.timeline.some((s) => s.id === 'bagDrop')).toBe(true);
    expect(plan.deadlines.some((d) => d.id === 'bagDropClose')).toBe(true);
    expectConsistentTimeline(plan);
  });

  it('uses the chosen terminal and falls back to the first one', () => {
    const base = {
      departureTime: at(12),
      destinationCountry: 'FR',
      hasCheckedBag: false,
      onlineCheckInDone: true,
      travelTimeMinutes: 30,
    };
    expect(calculateTrip({ ...base, airport: 'MXP', terminal: 'T2' }).terminal).toBe('T2');
    // T2 non esiste a Linate → si usa il primo terminal
    expect(calculateTrip({ ...base, airport: 'LIN', terminal: 'T2' }).terminal).toBe('T1');
  });
});
