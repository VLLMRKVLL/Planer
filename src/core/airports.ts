import type { AirlineId } from "./airlines";
import catalogData from "./data/airports.catalog.json";
import type { TimeSlot } from "./types";

// Terminal
export type TerminalId = "T1" | "T2";
export interface Terminal {
  id: TerminalId;
  name: string;
  securityMinutes: Record<TimeSlot, number>;
  bagDropMinutes: number;
  passportControlMinutes: number;
  // I gate extra-Schengen sono spesso in un'altra zona (es. MXP T1, satellite B)
  walkToGateMinutes: { schengen: number; nonSchengen: number };
  source?: string; // la fonte da dove si è preso il dato
  verifiedAt?: string; // data di verifica
}

// Aeroporto
// Codice IATA (es. "MXP"): i codici validi sono quelli del catalogo
export type AirportCode = string;
export type AirportSize = "large" | "medium" | "small";

// Una riga del catalogo: dati anagrafici, senza tempi
export interface CatalogAirport {
  code: AirportCode;
  name: string; // in inglese, come in OurAirports
  city: string;
  country: string; // ISO 3166-1 alpha-2
  size: AirportSize;
}

// Terminal usato da una compagnia in un aeroporto (es. easyJet a MXP → T2)
export type AirlineTerminals = Partial<Record<AirlineId, TerminalId>>;

// Quello che usa il calcolo: anagrafica + terminal (calibrati o di default)
export interface Airport extends CatalogAirport {
  terminals: [Terminal, ...Terminal[]];
  airlineTerminals: AirlineTerminals;
  // false → i tempi sono quelli generici del profilo di default
  calibrated: boolean;
}

interface AirportProfile {
  terminals: [Terminal, ...Terminal[]];
  airlineTerminals?: AirlineTerminals;
}

// Catalogo generato da scripts/generate-airports.mjs (OurAirports, aggiornato ogni mese)
export const AIRPORT_CATALOG = catalogData as CatalogAirport[];
const CATALOG_BY_CODE = new Map(AIRPORT_CATALOG.map((a) => [a.code, a]));

// Aeroporti calibrati a mano: terminal e tempi specifici.
// Non esistono misure pubbliche precise: le Carte dei Servizi danno solo
// l'attesa in coda al 90° percentile, a cui si aggiunge il passaggio ai varchi.
// Passaporti più prudenti per l'EES (registrazione extra-UE, attivo da ottobre 2025)
const AIRPORT_PROFILES: Partial<Record<AirportCode, AirportProfile>> = {
  LIN: {
    terminals: [
      {
        id: "T1",
        name: "Terminal",
        securityMinutes: { earlyMorning: 20, day: 15, evening: 10 },
        bagDropMinutes: 15,
        passportControlMinutes: 15,
        walkToGateMinutes: { schengen: 10, nonSchengen: 10 },
        source: "Carta dei Servizi SEA Linate 2026 + stima (terminal unico e compatto)",
        verifiedAt: "2026-10-19",
      },
    ],
  },
  MXP: {
    terminals: [
      {
        id: "T1",
        name: "Terminal 1",
        securityMinutes: { earlyMorning: 30, day: 25, evening: 20 },
        bagDropMinutes: 25,
        passportControlMinutes: 25,
        // I gate extra-Schengen (satelliti B/C) sono più lontani
        walkToGateMinutes: { schengen: 15, nonSchengen: 20 },
        source: "Carta dei Servizi SEA Malpensa 2026 + stima (terminal grande, gate lontani)",
        verifiedAt: "2026-10-19",
      },
      {
        id: "T2",
        name: "Terminal 2",
        securityMinutes: { earlyMorning: 25, day: 20, evening: 15 },
        bagDropMinutes: 15,
        passportControlMinutes: 15,
        walkToGateMinutes: { schengen: 10, nonSchengen: 10 },
        source: "easyJet/SEA, riapertura 2023: 21 self bag drop e 9 corsie automatiche + stima",
        verifiedAt: "2026-10-19",
      },
    ],
    // Il T2 è usato solo da easyJet
    airlineTerminals: { easyjet: "T2" },
  },
  BGY: {
    terminals: [
      {
        id: "T1",
        name: "Terminal",
        // Picchi al mattino presto per le partenze delle basi low cost
        securityMinutes: { earlyMorning: 35, day: 25, evening: 20 },
        bagDropMinutes: 25,
        passportControlMinutes: 20,
        walkToGateMinutes: { schengen: 10, nonSchengen: 10 },
        source: "Carta dei Servizi SACBO + stima (picchi al mattino presto)",
        verifiedAt: "2026-10-19",
      },
    ],
  },
};

// Tempi PRUDENTI per gli aeroporti non calibrati, in base alla dimensione:
// per un aeroporto che non si conosce è meglio arrivare un po' prima.
// Mai più veloci di uno scalo calibrato della stessa dimensione.
const DEFAULT_TERMINALS: Record<AirportSize, Terminal> = {
  large: {
    id: "T1",
    name: "Terminal",
    securityMinutes: { earlyMorning: 35, day: 30, evening: 25 },
    bagDropMinutes: 30,
    passportControlMinutes: 30,
    walkToGateMinutes: { schengen: 15, nonSchengen: 20 },
    source: "profilo generico (aeroporto grande): un po' più lento di MXP T1",
    verifiedAt: "2026-10-19",
  },
  medium: {
    id: "T1",
    name: "Terminal",
    securityMinutes: { earlyMorning: 30, day: 25, evening: 20 },
    bagDropMinutes: 25,
    passportControlMinutes: 20,
    walkToGateMinutes: { schengen: 10, nonSchengen: 15 },
    source: "profilo generico (aeroporto medio): simile a BGY",
    verifiedAt: "2026-10-19",
  },
  small: {
    id: "T1",
    name: "Terminal",
    securityMinutes: { earlyMorning: 20, day: 15, evening: 10 },
    bagDropMinutes: 15,
    passportControlMinutes: 15,
    walkToGateMinutes: { schengen: 5, nonSchengen: 5 },
    source: "profilo generico (aeroporto piccolo): pochi voli, code brevi",
    verifiedAt: "2026-10-19",
  },
};

// Aeroporto completo dal codice IATA; undefined se il codice non è nel catalogo
export function getAirport(code: AirportCode): Airport | undefined {
  const entry = CATALOG_BY_CODE.get(code.trim().toUpperCase());
  if (!entry) return undefined;

  const profile = AIRPORT_PROFILES[entry.code];
  return {
    ...entry,
    terminals: profile?.terminals ?? [DEFAULT_TERMINALS[entry.size]],
    airlineTerminals: profile?.airlineTerminals ?? {},
    calibrated: profile !== undefined,
  };
}

// Aeroporti di un paese, ordinati per nome (per la select della UI)
export function getAirportsByCountry(country: string): CatalogAirport[] {
  const code = country.trim().toUpperCase();
  return AIRPORT_CATALOG.filter((a) => a.country === code).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

// Codici dei profili calibrati (per i test di coerenza con il catalogo)
export const CALIBRATED_AIRPORT_CODES = Object.keys(AIRPORT_PROFILES);

// Terminal da usare: quello scelto, poi quello della compagnia, poi il primo
export function resolveTerminal(
  airport: Airport,
  terminalId?: TerminalId,
  airline?: AirlineId,
): Terminal {
  const find = (id?: TerminalId) => airport.terminals.find((t) => t.id === id);
  const airlineTerminal = airline ? airport.airlineTerminals[airline] : undefined;
  return find(terminalId) ?? find(airlineTerminal) ?? airport.terminals[0];
}
