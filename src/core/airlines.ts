export type AirlineId = 'default' | 'ita' | 'ryanair' | 'easyjet' | 'wizzair';

export interface Airline {
  id: AirlineId;
  name: string;
  // Minuti prima della partenza in cui chiude il gate
  gateCloseMinutes: number;
  // Minuti prima della partenza in cui chiude il banco bagagli.
  // Alcune compagnie (es. ITA) chiudono prima per i voli extra-Schengen
  bagDropCloseMinutes: { schengen: number; nonSchengen: number };
  source?: string; // la fonte da dove si è preso il dato
  verifiedAt?: string; // data di verifica
}

// Tempi verificati sui siti delle compagnie (possono variare per aeroporto:
// fa fede la carta d'imbarco). "default" usa valori prudenti: si usa quando
// l'utente non indica la compagnia.
export const AIRLINES: Record<AirlineId, Airline> = {
  default: {
    id: 'default',
    name: 'Non so / altra',
    gateCloseMinutes: 30,
    bagDropCloseMinutes: { schengen: 60, nonSchengen: 60 },
    source: 'valori prudenti (il più alto tra le compagnie note)',
  },
  ita: {
    id: 'ita',
    name: 'ITA Airways',
    gateCloseMinutes: 15,
    bagDropCloseMinutes: { schengen: 40, nonSchengen: 60 },
    source: 'ita-airways.com, "Check-in deadlines"',
    verifiedAt: '2026-10-19',
  },
  ryanair: {
    id: 'ryanair',
    name: 'Ryanair',
    gateCloseMinutes: 30,
    // 40' fino al 9/11/2026, 60' dal 10/11/2026: si usa già il nuovo valore
    bagDropCloseMinutes: { schengen: 60, nonSchengen: 60 },
    source: 'help.ryanair.com, "Estimated Times at the Airport" + annuncio aprile 2026',
    verifiedAt: '2026-10-19',
  },
  easyjet: {
    id: 'easyjet',
    name: 'easyJet',
    gateCloseMinutes: 30,
    // In alcuni aeroporti (es. Londra Luton, Amsterdam) il banco chiude a 60'
    bagDropCloseMinutes: { schengen: 40, nonSchengen: 40 },
    source: 'easyjet.com, FAQ check-in e pagine aeroporto',
    verifiedAt: '2026-10-19',
  },
  wizzair: {
    id: 'wizzair',
    name: 'Wizz Air',
    gateCloseMinutes: 30,
    // In alcuni aeroporti (es. Eindhoven, Dortmund) il banco chiude a 50'
    bagDropCloseMinutes: { schengen: 40, nonSchengen: 40 },
    source: 'wizzair.com, "Check-in and baggage drop-off times" (gate: dato non ufficiale)',
    verifiedAt: '2026-10-19',
  },
};
