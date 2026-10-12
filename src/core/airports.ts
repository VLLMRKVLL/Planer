import type { Airport, AirportCode } from './types';

// Stime PROVVISORIE, da calibrare con dati reali.
// Tenerle qui (e non sparse nel codice) permette di aggiungere aeroporti
// o di caricarle da remoto in futuro senza toccare la logica.
export const AIRPORTS: Record<AirportCode, Airport> = {
  LIN: {
    code: 'LIN',
    name: 'Milano Linate',
    securityMinutes: { earlyMorning: 20, day: 15, evening: 10 },
    bagDropMinutes: 15,
    passportControlMinutes: 10,
    walkToGateMinutes: 10,
  },
  MXP: {
    code: 'MXP',
    name: 'Milano Malpensa',
    securityMinutes: { earlyMorning: 30, day: 25, evening: 20 },
    bagDropMinutes: 25,
    passportControlMinutes: 20,
    walkToGateMinutes: 15,
  },
  BGY: {
    code: 'BGY',
    name: 'Bergamo Orio al Serio',
    securityMinutes: { earlyMorning: 35, day: 25, evening: 20 },
    bagDropMinutes: 25,
    passportControlMinutes: 15,
    walkToGateMinutes: 10,
  },
};

// Margine di sicurezza aggiunto sempre, in minuti
export const SAFETY_MARGIN_MINUTES = 15;
