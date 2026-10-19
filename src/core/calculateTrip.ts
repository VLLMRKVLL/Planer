import { AIRLINES } from "./airlines";
import { getAirport, resolveTerminal } from "./airports";
import { requiresPassportControl } from "./countries";
import { DEFAULT_MARGINS, type Margins } from "./margins";
import type { Deadline, FlightInput, StepDuration, TripPlan } from "./types";
import {
  addMinutes,
  buildTimeline,
  minutesBetween,
  securityMinutesEndingAt,
  subtractMinutes,
} from "./utils";

// Calcola a ritroso, dall'orario del volo, quando arrivare in aeroporto
// e quando partire da casa. Funzione pura: stesso input → stesso output.
export function calculateTrip(
  input: FlightInput,
  margins: Margins = DEFAULT_MARGINS,
): TripPlan {
  // Dati del terminal ed aeroporto
  const airport = getAirport(input.airport);
  if (!airport) {
    // Non succede dalla UI: i codici arrivano dal catalogo
    throw new Error(`Aeroporto sconosciuto: ${input.airport}`);
  }
  const terminal = resolveTerminal(airport, input.terminal, input.airline);

  // Passaporti: dipendono dal paese di partenza (quello dell'aeroporto) e da quello di arrivo
  const passportControlRequired = requiresPassportControl(
    airport.country,
    input.destinationCountry,
  );

  // Orario di partenza
  const departureTime = input.departureTime;
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
  const gateEndingTime = subtractMinutes(gateCloseAt, margins.gate);

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
  // Per i voli extra-Schengen alcune compagnie chiudono il banco prima
  const bagDropCloseMinutes = passportControlRequired
    ? airline.bagDropCloseMinutes.nonSchengen
    : airline.bagDropCloseMinutes.schengen;
  const bagDropCloseAt = subtractMinutes(departureTime, bagDropCloseMinutes);
  const bagDropLimit = subtractMinutes(bagDropCloseAt, margins.bagDrop);
  const arriveByBagDrop = needsBagDrop
    ? subtractMinutes(bagDropLimit, terminal.bagDropMinutes)
    : null;

  // tempo di viaggio
  const travelMinutes = input.travelTimeMinutes;
  const bagDropWins =
    arriveByBagDrop !== null && arriveByBagDrop < arriveByGate;
  const arriveAirportAt = bagDropWins ? arriveByBagDrop : arriveByGate;
  const leaveHomeAt = subtractMinutes(arriveAirportAt, travelMinutes);

  const steps: StepDuration[] = [{ id: "travel", minutes: travelMinutes }];
  if (needsBagDrop)
    steps.push({ id: "bagDrop", minutes: terminal.bagDropMinutes });
  steps.push({ id: "security", minutes: securityMinutes });
  if (passportControlRequired)
    steps.push({ id: "passportControl", minutes: passportControlMinutes });
  steps.push({ id: "walkToGate", minutes: walkToGateMinutes });

  // Tempo libero al gate fino alla chiusura (almeno il margine del gate).
  // Quando vince il banco si arriva prima e il tempo in più finisce qui.
  // Limite noto: in quel caso i controlli avvengono prima del previsto e la
  // fascia oraria reale potrebbe essere diversa da quella usata per il calcolo.
  const totalMinutes = steps.reduce((sum, step) => sum + step.minutes, 0);
  const atGateAt = addMinutes(leaveHomeAt, totalMinutes);
  steps.push({ id: "buffer", minutes: minutesBetween(atGateAt, gateCloseAt) });

  const timeline = buildTimeline(leaveHomeAt, steps);

  // Scadenze da mostrare sulla timeline
  const deadlines: Deadline[] = [];
  if (needsBagDrop) deadlines.push({ id: "bagDropClose", at: bagDropCloseAt });
  deadlines.push({ id: "gateClose", at: gateCloseAt });
  deadlines.push({ id: "departure", at: departureTime });

  return {
    leaveHomeAt,
    arriveAirportAt,
    terminal: terminal.id,
    timeline,
    deadlines,
    bindingConstraint: bagDropWins ? "bagDrop" : "gate",
  };
}
