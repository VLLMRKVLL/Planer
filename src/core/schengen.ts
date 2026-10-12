// Paesi dell'area Schengen (codici ISO 3166-1 alpha-2), aggiornato al 2025.
// Attenzione: Irlanda e Cipro sono UE ma NON Schengen; Svizzera e Norvegia
// non sono UE ma SONO Schengen.
export const SCHENGEN_COUNTRIES: ReadonlySet<string> = new Set([
  'AT', 'BE', 'BG', 'CH', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI',
  'FR', 'GR', 'HR', 'HU', 'IS', 'IT', 'LI', 'LT', 'LU', 'LV',
  'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK',
]);
