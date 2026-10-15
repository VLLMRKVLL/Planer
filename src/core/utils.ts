import { COUNTRIES } from './countries';
import type { TimeSlot } from './types';

// Restituisce la fascia oraria di una data (ora locale del dispositivo)
export function getTimeSlot(date: Date): TimeSlot {
  const hour = date.getHours();
  if (hour < 8) return 'earlyMorning';
  if (hour < 18) return 'day';
  return 'evening';
}

// Partendo dall'Italia, il controllo passaporti serve solo verso paesi extra-Schengen
export function requiresPassportControl(destinationCountry: string): boolean {
  const code = (destinationCountry ?? '').trim().toUpperCase();
  const country = COUNTRIES.find((c) => c.id === code);

  console.log(destinationCountry);
  console.log(country);

  return !country?.schengen;
}

// Sottrae minuti a una data senza modificarla (le funzioni pure non mutano gli input)
export function subtractMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() - minutes * 60_000);
}
