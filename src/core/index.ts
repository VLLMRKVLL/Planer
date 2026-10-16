// Punto d'ingresso pubblico di core/: la UI importa solo da qui
export * from "./types";

export {
    AIRPORTS, resolveTerminal, type Airport,
    type AirportCode,
    type Terminal,
    type TerminalId
} from "./airports";

export { DEFAULT_MARGINS } from "./margins";

export { AIRLINES, type Airline, type AirlineId } from "./airlines";

export { calculateTrip } from "./calculateTrip";

export { getTimeSlot } from "./utils";

export { COUNTRIES, requiresPassportControl } from "./countries";
