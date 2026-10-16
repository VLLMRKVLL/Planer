import type { Terminal } from "./airports";
import type { StepDuration, TimelineStep, TimeSlot } from "./types";

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

// Minuti tra due date (positivo se "to" è dopo "from")
export function minutesBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / 60_000);
}

// Durata della sicurezza sapendo quando deve finire.
// Guarda la fascia all'inizio e alla fine della coda e tiene la più prudente.
export function securityMinutesEndingAt(end: Date, terminal: Terminal): number {
  const atEnd = terminal.securityMinutes[getTimeSlot(end)];
  const start = subtractMinutes(end, atEnd);
  const atStart = terminal.securityMinutes[getTimeSlot(start)];
  return Math.max(atEnd, atStart);
}

// Mette in fila le tappe a partire da un orario: ogni tappa inizia dove finisce la precedente
export function buildTimeline(
  startAt: Date,
  steps: StepDuration[],
): TimelineStep[] {
  const timeline: TimelineStep[] = [];
  let t = startAt;

  steps.forEach((step) => {
    const endAt = addMinutes(t, step.minutes);
    timeline.push({ id: step.id, startAt: t, endAt, minutes: step.minutes });
    t = endAt;
  });

  return timeline;
}
