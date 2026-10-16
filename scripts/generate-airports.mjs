// Genera src/core/data/airports.catalog.json a partire dal dataset di OurAirports
// (pubblico dominio, https://ourairports.com/data/).
//
// Uso:  npm run data:airports
// Variabile opzionale OURAIRPORTS_CSV: percorso di un CSV locale da usare al posto del download.
//
// Lo script si ferma con un errore (exit code 1) se i dati sembrano sbagliati,
// così il workflow mensile non apre una PR con un catalogo rotto.

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";

const SOURCE_URL = "https://davidmegginson.github.io/ourairports-data/airports.csv";
const OUTPUT = resolve(dirname(fileURLToPath(import.meta.url)), "../src/core/data/airports.catalog.json");

// Tipi OurAirports che teniamo → dimensione usata dall'app per i tempi di default
const SIZES = { large_airport: "large", medium_airport: "medium", small_airport: "small" };
const SIZE_RANK = { large: 3, medium: 2, small: 1 };

// Aeroporti che devono esserci sempre: hanno tempi calibrati in airports.ts
const REQUIRED_CODES = ["LIN", "MXP", "BGY"];
// Se il numero di aeroporti cala più di così rispetto al file precedente, qualcosa non va
const MAX_DROP_RATIO = 0.2;

async function loadCsv() {
  const localPath = process.env.OURAIRPORTS_CSV;
  if (localPath) return readFileSync(localPath, "utf8");

  const response = await fetch(SOURCE_URL);
  if (!response.ok) throw new Error(`Download fallito: HTTP ${response.status}`);
  return response.text();
}

function toCatalog(rows) {
  const byCode = new Map();
  const warnings = [];

  for (const row of rows) {
    const size = SIZES[row.type];
    const code = row.iata_code?.trim().toUpperCase();
    if (!size || row.scheduled_service !== "yes" || !/^[A-Z]{3}$/.test(code ?? "")) continue;

    const airport = {
      code,
      name: row.name.trim(),
      city: row.municipality?.trim() ?? "",
      country: row.iso_country.trim().toUpperCase(),
      size,
    };

    // Lo stesso codice IATA su più righe: si tiene l'aeroporto più grande
    const existing = byCode.get(code);
    if (existing) {
      warnings.push(`Codice duplicato ${code}: "${existing.name}" / "${airport.name}"`);
      if (SIZE_RANK[airport.size] <= SIZE_RANK[existing.size]) continue;
    }
    byCode.set(code, airport);
  }

  const catalog = [...byCode.values()].sort((a, b) => a.code.localeCompare(b.code));
  return { catalog, warnings };
}

function checkCatalog(catalog) {
  const codes = new Set(catalog.map((a) => a.code));
  const missing = REQUIRED_CODES.filter((code) => !codes.has(code));
  if (missing.length > 0) throw new Error(`Mancano aeroporti obbligatori: ${missing.join(", ")}`);

  if (existsSync(OUTPUT)) {
    const previous = JSON.parse(readFileSync(OUTPUT, "utf8"));
    const minimum = Math.floor(previous.length * (1 - MAX_DROP_RATIO));
    if (catalog.length < minimum) {
      throw new Error(`Aeroporti scesi da ${previous.length} a ${catalog.length}: controlla la sorgente`);
    }
  }
}

// Un aeroporto per riga: i diff della PR mensile mostrano solo le righe cambiate
function serialize(catalog) {
  return `[\n${catalog.map((a) => JSON.stringify(a)).join(",\n")}\n]\n`;
}

async function main() {
  const rows = parse(await loadCsv(), { columns: true, skip_empty_lines: true });
  const { catalog, warnings } = toCatalog(rows);
  checkCatalog(catalog);

  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, serialize(catalog));

  const bySize = Object.groupBy(catalog, (a) => a.size);
  console.log(
    `Catalogo scritto: ${catalog.length} aeroporti ` +
      `(large ${bySize.large?.length ?? 0}, medium ${bySize.medium?.length ?? 0}, small ${bySize.small?.length ?? 0})`,
  );
  for (const warning of warnings) console.warn(`Attenzione: ${warning}`);
}

main().catch((error) => {
  console.error(`Errore: ${error.message}`);
  process.exit(1);
});
