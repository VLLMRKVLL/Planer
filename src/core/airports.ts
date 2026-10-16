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
export type AirportCode = "LIN" | "MXP" | "BGY";
export interface Airport {
  code: AirportCode;
  name: string;
  terminals: [Terminal, ...Terminal[]];
}

export function resolveTerminal(
  airport: Airport,
  terminalId?: TerminalId,
): Terminal {
  return (
    airport.terminals.find((t) => t.id === terminalId) ?? airport.terminals[0]
  );
}

// Lista degli aeroporti
// TODO: trovare un modo per aggiungere in automatico gli aeroporti
export const AIRPORTS: Record<AirportCode, Airport> = {
  LIN: {
    code: "LIN",
    name: "Milano Linate",
    terminals: [
      {
        id: "T1",
        name: "Terminal",
        securityMinutes: { earlyMorning: 20, day: 15, evening: 10 },
        bagDropMinutes: 15,
        passportControlMinutes: 10,
        walkToGateMinutes: { schengen: 10, nonSchengen: 10 },
        source: "stima provvisoria",
      },
    ],
  },
  MXP: {
    code: "MXP",
    name: "Milano Malpensa",
    terminals: [
      {
        id: "T1",
        name: "Terminal 1",
        securityMinutes: { earlyMorning: 30, day: 25, evening: 20 },
        bagDropMinutes: 25,
        passportControlMinutes: 20,
        walkToGateMinutes: { schengen: 15, nonSchengen: 15 },
        source: "stima provvisoria",
      },
      {
        id: "T2",
        name: "Terminal 2",
        securityMinutes: { earlyMorning: 30, day: 25, evening: 20 },
        bagDropMinutes: 25,
        passportControlMinutes: 20,
        walkToGateMinutes: { schengen: 15, nonSchengen: 15 },
        source: "copiato da T1, da calibrare",
      },
    ],
  },
  BGY: {
    code: "BGY",
    name: "Bergamo Orio al Serio",
    terminals: [
      {
        id: "T1",
        name: "Terminal",
        securityMinutes: { earlyMorning: 35, day: 25, evening: 20 },
        bagDropMinutes: 25,
        passportControlMinutes: 15,
        walkToGateMinutes: { schengen: 10, nonSchengen: 10 },
        source: "stima provvisoria",
      },
    ],
  },
};
