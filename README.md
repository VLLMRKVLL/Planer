# Planer

App iPhone (React Native + Expo, TypeScript) che calcola **a che ora arrivare in aeroporto** e **a che ora partire da casa**, con il dettaglio delle tappe: drop bagagli, sicurezza, passaporti, cammino al gate, margine.

MVP: Linate (LIN), Malpensa (MXP), Bergamo (BGY). Tutto in locale, niente backend.

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

## Roadmap

Fasi, passi da fare e come segnarli: [ROADMAP.md](ROADMAP.md).
