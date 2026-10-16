import { Terminal } from "./airports";
import { COUNTRIES } from "./countries";
import type { TimeSlot } from "./types";

// Restituisce la fascia oraria di una data (ora locale del dispositivo)
export function getTimeSlot(date: Date): TimeSlot {
  const hour = date.getHours();
  if (hour < 8) return "earlyMorning";
  if (hour < 18) return "day";
  return "evening";
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

// Sottrae minuti a una data senza modificarla (le funzioni pure non mutano gli input)
export function subtractMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() - minutes * 60_000);
}

// Durata della sicurezza sapendo quando deve finire.
// Guarda la fascia all'inizio e alla fine della coda e tiene la più prudente.
export function securityMinutesEndingAt(end: Date, terminal: Terminal): number {
  const atEnd = terminal.securityMinutes[getTimeSlot(end)];
  const start = subtractMinutes(end, atEnd);
  const atStart = terminal.securityMinutes[getTimeSlot(start)];
  return Math.max(atEnd, atStart);
}