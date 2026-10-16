import { AIRLINES } from "./airlines";
import { AIRPORTS, resolveTerminal } from "./airports";
import { requiresPassportControl } from "./countries";
import { DEFAULT_MARGINS } from "./margins";
import type { FlightInput, TripPlan } from "./types";
import { securityMinutesEndingAt, subtractMinutes } from "./utils";

export function calculateTrip(input: FlightInput): TripPlan | null {
  // Dati della nazione di arrivo
  const destinationCountry = input.destinationCountry;
  const passportControlRequired = requiresPassportControl(destinationCountry);

  // Orario di partenza
  const departureTime = input.departureTime;

  // Dati del terminal ed aeroporto
  const airport = AIRPORTS[input.airport];
  const terminal = resolveTerminal(airport, input.terminal);
  const walkToGateMinutes = passportControlRequired
    ? terminal.walkToGateMinutes.nonSchengen
    : terminal.walkToGateMinutes.schengen;
  const passportControlMinutes = passportControlRequired
    ? terminal.passportControlMinutes
    : 0;

  // Tempo dopo i controlli: passaporti (se servono) + cammino al gate
  const afterSecurityMinutes = walkToGateMinutes + passportControlMinutes;

  const airline = AIRLINES[input.airline ?? "default"];

  // Chiusura gate: l'orario reale serve anche per buffer e deadlines
  const gateCloseAt = subtractMinutes(departureTime, airline.gateCloseMinutes);

  // Controllo dei bagagli
  const needsBagDrop = input.hasCheckedBag || !input.onlineCheckInDone;

  // GATE => partenza - chiusura gate - margine gate
  const gateEndingTime = subtractMinutes(gateCloseAt, DEFAULT_MARGINS.gate);

  // FINE_CONTROLLI => GATE - cammino - passaporti (se necessari)
  const securityChecksTimeEnd = subtractMinutes(
    gateEndingTime,
    afterSecurityMinutes,
  );

  // INIZIO_CONTROLLI => FINE_CONTROLLI - durata di sicurezza
  const securityMinutes = securityMinutesEndingAt(
    securityChecksTimeEnd,
    terminal,
  );
  const securityChecksTimeStart = subtractMinutes(
    securityChecksTimeEnd,
    securityMinutes,
  );

  // ARRIVO (gate) => INIZIO_CONTROLLI - banco (se necessario)
  const arriveByGate = needsBagDrop
    ? subtractMinutes(securityChecksTimeStart, terminal.bagDropMinutes)
    : securityChecksTimeStart;

  // ARRIVO (banco) ==> partenza - chiusura banco - margine banco - durata banco
  const bagDropCloseAt = subtractMinutes(
    departureTime,
    airline.bagDropCloseMinutes,
  );
  const bagDropLimit = subtractMinutes(bagDropCloseAt, DEFAULT_MARGINS.bagDrop);
  const arriveByBagDrop = needsBagDrop
    ? subtractMinutes(bagDropLimit, terminal.bagDropMinutes)
    : null;

  // tempo di viaggio
  const travelMinutes = input.travelTimeMinutes;
  const bagDropWins =
    arriveByBagDrop !== null && arriveByBagDrop < arriveByGate;
  const arriveAirportAt = bagDropWins ? arriveByBagDrop : arriveByGate;
  const leaveHomeAt = subtractMinutes(arriveAirportAt, travelMinutes);

  return null;
}