import { AIRLINES } from './airlines';
import { AIRPORTS, SAFETY_MARGIN_MINUTES } from './airports';
import type { FlightInput, Step, TripPlan } from './types';
import { getTimeSlot, requiresPassportControl, subtractMinutes } from './utils';

// Calcola a ritroso, dall'orario del volo, quando arrivare in aeroporto
// e quando partire da casa. Funzione pura: stesso input → stesso output.
export function calculateTrip(input: FlightInput): TripPlan {
  const airport = AIRPORTS[input.airport];
  const airline = AIRLINES[input.airline ?? 'default'];
  // Semplificazione MVP: la fascia oraria si ricava dall'orario del volo
  const slot = getTimeSlot(input.departureTime);
  const needsBagDrop = input.hasCheckedBag || !input.onlineCheckInDone;

  // Tappe in aeroporto, in ordine cronologico. Le tappe non necessarie non compaiono.
  const airportSteps: Step[] = [
    ...(needsBagDrop ? [{ id: 'bagDrop' as const, minutes: airport.bagDropMinutes }] : []),
    { id: 'security', minutes: airport.securityMinutes[slot] },
    ...(requiresPassportControl(input.destinationCountry)
      ? [{ id: 'passportControl' as const, minutes: airport.passportControlMinutes }]
      : []),
    { id: 'walkToGate', minutes: airport.walkToGateMinutes },
    { id: 'margin', minutes: SAFETY_MARGIN_MINUTES },
  ];

  // Vincolo 1: essere al gate prima che chiuda
  const totalAirportMinutes = airportSteps.reduce((sum, step) => sum + step.minutes, 0);
  const byGate = subtractMinutes(input.departureTime, airline.gateCloseMinutes + totalAirportMinutes);

  // Vincolo 2: finire la coda al banco prima che chiuda (solo se serve il banco)
  const byBagDrop = needsBagDrop
    ? subtractMinutes(input.departureTime, airline.bagDropCloseMinutes + airport.bagDropMinutes)
    : null;

  // Vince l'orario più prudente, cioè il più presto
  const bagDropWins = byBagDrop !== null && byBagDrop < byGate;
  const arriveAirportAt = bagDropWins ? byBagDrop : byGate;

  return {
    arriveAirportAt,
    leaveHomeAt: subtractMinutes(arriveAirportAt, input.travelTimeMinutes),
    steps: [{ id: 'travel', minutes: input.travelTimeMinutes }, ...airportSteps],
    bindingConstraint: bagDropWins ? 'bagDrop' : 'gate',
  };
}
