import countries from "i18n-iso-countries";
import it from "i18n-iso-countries/langs/it.json";

// Il controllo passaporti non serve per i voli nazionali e per quelli tra due paesi Schengen.
// Un codice sconosciuto conta come extra-Schengen (scelta prudente).
export function requiresPassportControl(
  originCountry: string,
  destinationCountry: string,
): boolean {
  const origin = (originCountry ?? "").trim().toUpperCase();
  const destination = (destinationCountry ?? "").trim().toUpperCase();
  if (origin === destination) return false;

  const isSchengen = (code: string) =>
    COUNTRIES.find((c) => c.id === code)?.schengen ?? false;
  return !(isSchengen(origin) && isSchengen(destination));
}

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