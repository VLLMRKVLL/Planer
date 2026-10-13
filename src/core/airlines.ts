import type { Airline, AirlineId } from './types';

// Stime PROVVISORIE, da verificare sui siti delle compagnie.
// "default" usa valori prudenti: si usa quando l'utente non indica la compagnia.
export const AIRLINES: Record<AirlineId, Airline> = {
  default: { id: 'default', name: 'Non so / altra', gateCloseMinutes: 30, bagDropCloseMinutes: 60 },
  ita: { id: 'ita', name: 'ITA Airways', gateCloseMinutes: 20, bagDropCloseMinutes: 60 },
  ryanair: { id: 'ryanair', name: 'Ryanair', gateCloseMinutes: 20, bagDropCloseMinutes: 40 },
  easyjet: { id: 'easyjet', name: 'easyJet', gateCloseMinutes: 30, bagDropCloseMinutes: 40 },
  wizzair: { id: 'wizzair', name: 'Wizz Air', gateCloseMinutes: 30, bagDropCloseMinutes: 40 },
};
