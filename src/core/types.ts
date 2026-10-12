// Tipi condivisi dalla logica di calcolo. Nessuna dipendenza da React:
// questo file deve poter girare ovunque (app, test, un domani un backend).

export type AirportCode = 'LIN' | 'MXP' | 'BGY';

// Fasce orarie: earlyMorning (<8), day (8–18), evening (>=18)
export type TimeSlot = 'earlyMorning' | 'day' | 'evening';

export interface Airport {
  code: AirportCode;
  name: string;
  // Minuti stimati per ogni tappa (valori provvisori, da calibrare)
  securityMinutes: Record<TimeSlot, number>;
  bagDropMinutes: number;
  passportControlMinutes: number;
  walkToGateMinutes: number;
}

export type AirlineId = 'default' | 'ita' | 'ryanair' | 'easyjet' | 'wizzair';

export interface Airline {
  id: AirlineId;
  name: string;
  // Minuti prima della partenza in cui chiude il gate
  gateCloseMinutes: number;
  // Minuti prima della partenza in cui chiude il banco bagagli
  bagDropCloseMinutes: number;
}

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
}

export type StepId = 'travel' | 'bagDrop' | 'security' | 'passportControl' | 'walkToGate' | 'margin';

export interface Step {
  id: StepId;
  minutes: number;
}

export interface TripPlan {
  leaveHomeAt: Date;
  arriveAirportAt: Date;
  // Tappe in ordine cronologico (da casa al gate)
  steps: Step[];
  // Quale vincolo ha determinato l'orario: chiusura gate o chiusura banco bagagli
  bindingConstraint: 'gate' | 'bagDrop';
}
