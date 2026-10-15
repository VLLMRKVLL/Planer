// Punto d'ingresso pubblico di core/: la UI importa solo da qui
export * from './types';
export { AIRPORTS, SAFETY_MARGIN_MINUTES } from './airports';
export { AIRLINES } from './airlines';
export { calculateTrip } from './calculateTrip';
export { getTimeSlot, requiresPassportControl } from './utils';
export { COUNTRIES } from './countries';