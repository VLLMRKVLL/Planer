export const COUNTRIES = [
  { id: "FR", name: "Francia", schengen: true },
  { id: "GB", name: "Regno Unito", schengen: false },
  { id: "US", name: "Stati Uniti", schengen: false },
  { id: "IT", name: "Italia", schengen: true },
] as const;

export type CountryCode = (typeof COUNTRIES)[number]["id"];
