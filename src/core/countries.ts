import countries from "i18n-iso-countries";
import it from "i18n-iso-countries/langs/it.json";

export const SCHENGEN_COUNTRIES: ReadonlySet<string> = new Set([
  "AT", "BE", "BG", "CH", "CZ", "DE", "DK", "EE", "ES", "FI",
  "FR", "GR", "HR", "HU", "IS", "IT", "LI", "LT", "LU", "LV",
  "MT", "NL", "NO", "PL", "PT", "RO", "SE", "SI", "SK",
]);

countries.registerLocale(it);

export const COUNTRIES = Object.entries(countries.getNames("it"))
  .map(([id, name]) => ({ id, name, schengen: SCHENGEN_COUNTRIES.has(id) }))
  .sort((a, b) => a.name.localeCompare(b.name, "it"));

export type CountryCode = (typeof COUNTRIES)[number]["id"];