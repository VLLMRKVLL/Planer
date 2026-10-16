// Tipi condivisi dalla logica di calcolo. Nessuna dipendenza da React:
// questo file deve poter girare ovunque (app, test, un domani un backend).

import type { AirlineId } from "./airlines";
import type { AirportCode, TerminalId } from "./airports";

// Fasce orarie: earlyMorning (<8), day (8–18), evening (>=18)
export type TimeSlot = "earlyMorning" | "day" | "evening";

export interface FlightInput {
  airport: AirportCode;
  departureTime: Date;
  // Codice ISO 3166-1 alpha-2 del paese di destinazione (es. "FR", "GB")
  destinationCountry: string;
  hasCheckedBag: boolean;
  onlineCheckInDone: boolean;
  travelTimeMinutes: number;
  // Opzionale: se manca usiamo valori prudenti (vedi airlines.ts)
  airline?: AirlineId;
  terminal?: TerminalId;
}

// Passaggi da seguire in aeroporto
export type StepId =
  | "travel"
  | "bagDrop"
  | "security"
  | "passportControl"
  | "walkToGate"
  | "buffer";   // margine per evitare problemi

// Tempo che ci si mette ad effettuare questi step
export interface TimelineStep {
  id: StepId;
  startAt: Date;
  endAt: Date;
  minutes: number;
}

// Il termine dello step
export type DeadlineId = "bagDropClose" | "gateClose" | "departure";

export interface Deadline {
  id: DeadlineId;
  at: Date;
}

export interface TripPlan {
  leaveHomeAt: Date;
  arriveAirportAt: Date;
  terminal: TerminalId;
  timeline: TimelineStep[];
  deadlines: Deadline[];
  bindingConstraint: "gate" | "bagDrop";
}
