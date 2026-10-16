export interface Margins {
  gate: number;     // minuti di anticipo sulla chiusura del gate
  bagDrop: number;  // minuti di anticipo sulla chiusura del banco
}

export const DEFAULT_MARGINS: Margins = { gate: 15, bagDrop: 10 };