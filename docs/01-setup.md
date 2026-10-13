# 1. Setup e comandi

## Da cosa è partito il progetto

```bash
npx create-expo-app@latest planer --template default
```

Il template di default (SDK 57) include Expo Router e una demo con tab, componenti a tema e animazioni. **Ho rimosso tutta la demo** (`src/components`, `src/hooks`, `src/constants`, `src/app/explore.tsx`, lo script `reset-project`) per lasciare solo il minimo indispensabile. Ho tolto anche il file `LICENSE` del template (copyright Expo): la licenza la scegli tu (consiglio MIT, è la più comune per i progetti portfolio).

## Jest

Installato con:

```bash
npx expo install jest-expo jest @types/jest -- --save-dev
```

`npx expo install` sceglie le versioni compatibili con l'SDK di Expo (qui `jest-expo ~57`, `jest ^29`). In `package.json`:

```json
"scripts": { "test": "jest", "typecheck": "tsc --noEmit" },
"jest": { "preset": "jest-expo" }
```

In `tsconfig.json` ho aggiunto `"types": ["jest"]`: da TypeScript 6 i tipi globali (`describe`, `it`, `expect`) non vengono più caricati in automatico, quindi senza questa riga `tsc` dà errore sui file di test anche se Jest li esegue senza problemi.

## Comandi

| Comando | Cosa fa |
|---|---|
| `npm start` | Avvia il dev server Expo; apri l'app con Expo Go |
| `npm test` | Esegue i test (`*.test.ts`) |
| `npm test -- --watch` | Rilancia i test a ogni salvataggio |
| `npm run typecheck` | Controlla i tipi senza produrre file |
| `npm run lint` | ESLint con la config di Expo (al primo avvio la installa) |

## Windows: errore ExecutionPolicy

PowerShell di default blocca gli script `.ps1`, e `npm`/`npx` passano da uno di questi. Hai due soluzioni:

- **Consigliata:** `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` (vale solo per il tuo utente, e consente gli script locali e quelli firmati).
- In alternativa usa **Git Bash** o **cmd** come terminale di VS Code.

## Verifiche fatte su questo branch

- `npm test`: 10 test su 10 passati
- `npm run typecheck`: nessun errore
- `npx expo export --platform ios`: il bundle iOS si compila
- Il lint **non** l'ho eseguito, perché l'ambiente in cui ho lavorato non poteva scaricare `eslint-config-expo`. Lancialo tu la prima volta.
