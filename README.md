# Planer

App iPhone (React Native + Expo, TypeScript) che calcola **a che ora arrivare in aeroporto** e **a che ora partire da casa**, con il dettaglio delle tappe: drop bagagli, sicurezza, passaporti, cammino al gate, margine.

Tempi calibrati per Linate (LIN), Malpensa (MXP) e Bergamo (BGY); tutti gli altri aeroporti con voli di linea usano tempi generici in base alla dimensione. Tutto in locale, niente backend.

## Avvio rapido

```bash
npm install
npm start        # apre Expo: scansiona il QR con Expo Go sull'iPhone
npm test         # test Jest della logica in src/core
npm run typecheck
```

> Su Windows, se PowerShell blocca `npm`/`npx` con un errore di *ExecutionPolicy*, vedi [docs/01-setup.md](docs/01-setup.md#windows-errore-executionpolicy).

## Documentazione

1. [Setup e comandi](docs/01-setup.md)
2. [Architettura e modello di calcolo](docs/02-architettura.md)
3. [Decisioni, punti aperti ed esercizi](docs/03-decisioni-ed-esercizi.md)

## Dati

**Aeroporti.** Il catalogo in `src/core/data/airports.catalog.json` è generato dai dati di [OurAirports](https://ourairports.com/data/), rilasciati nel pubblico dominio. Grazie a David Megginson e a tutti i contributori.

Lo script `scripts/generate-airports.mjs` tiene gli aeroporti con voli di linea e codice IATA (grandi, medi e piccoli). Il workflow [`update-airports.yml`](.github/workflows/update-airports.yml) lo esegue il 1° di ogni mese: se il catalogo cambia, apre una Pull Request già controllata da test e typecheck. Per lanciarlo a mano:

```bash
npm run data:airports
```

Oppure dalla pagina **Actions** di GitHub, con *Run workflow*.

**Tempi.** I tempi calibrati sono in `AIRPORT_PROFILES` (`src/core/airports.ts`), quelli generici in `DEFAULT_TERMINALS`.

**Paesi.** Nomi in italiano da [`i18n-iso-countries`](https://www.npmjs.com/package/i18n-iso-countries).

## Roadmap

Fasi, passi da fare e come segnarli: [ROADMAP.md](ROADMAP.md).

## Licenza

[MIT](LICENSE). I dati degli aeroporti vengono da [OurAirports](https://ourairports.com/data/) (pubblico dominio).
