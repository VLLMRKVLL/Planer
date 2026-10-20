# 2. Architettura e modello di calcolo

## Struttura

```
src/
  app/                   ← SOLO schermate (Expo Router: ogni file = una route)
    _layout.tsx          ← layout radice: tema + tab nativi (NativeTabs)
    (calculator)/        ← tab del calcolatore (gruppo: la cartella non entra nell'URL)
      _layout.tsx        ← Stack con il titolo del tab
      index.tsx          ← route "/": form + risultato, la schermata che si apre all'avvio
    flights/             ← tab dei voli salvati (route "/flights")
      _layout.tsx        ← Stack con il titolo del tab
      index.tsx          ← per ora un segnaposto
  core/                  ← logica pura, zero React
    types.ts             ← tipi condivisi (FlightInput, TripPlan, timeline, scadenze)
    airports.ts          ← catalogo, profili calibrati, default per dimensione, terminal per compagnia
    airlines.ts          ← chiusura gate / banco per compagnia (verificati sui siti)
    countries.ts         ← lista dei paesi in italiano, set Schengen, requiresPassportControl
    margins.ts           ← margini di sicurezza su gate e banco (DEFAULT_MARGINS)
    utils.ts             ← fasce orarie, aritmetica sulle date, durata della sicurezza, buildTimeline
    calculateTrip.ts     ← la funzione di calcolo principale
    index.ts             ← "barrel": l'API pubblica di core/
    data/
      airports.catalog.json  ← generato da scripts/generate-airports.mjs, non si modifica a mano
    *.test.ts            ← test Jest accanto al file che testano
  components/            ← componenti riutilizzabili (ThemedText, Chips, Select, TripResult)
  constants/theme.ts     ← palette chiara e scura
  hooks/useTheme.ts      ← palette del tema attivo
  __tests__/             ← test delle schermate (fuori da app/: lì ogni file diventa una pagina)
scripts/
  generate-airports.mjs  ← scarica OurAirports e rigenera il catalogo (`npm run data:airports`)
.github/workflows/
  ci.yml                 ← test, typecheck, lint ed expo-doctor a ogni PR e su main
  update-airports.yml    ← ogni mese rigenera il catalogo e apre una PR se è cambiato
```

**Nota:** nel piano originale `core/` stava nella root. Il template SDK 57 però mette tutto il codice in `src/` e definisce l'alias `@/*` → `./src/*`, quindi la logica sta in `src/core/`. La UI la importa con `import { calculateTrip } from '@/core'`, e gli import con `@/` non cambiano se un file viene spostato.

## Navigazione

L'app ha due tab, definiti nel layout radice con `NativeTabs` (da `expo-router/unstable-native-tabs`): è la tab bar nativa di iOS, con icone SF Symbols e tema chiaro/scuro automatico. `unstable` vuol dire che l'API può cambiare in un prossimo SDK, ma l'uso è confinato in `app/_layout.tsx`.

- Il `name` di ogni `NativeTabs.Trigger` è il nome della route, cioè della cartella: `"(calculator)"` e `"flights"`.
- `(calculator)` è un **gruppo**: le parentesi tengono la cartella fuori dall'URL, così il calcolatore resta su `/` ed è la prima schermata all'avvio.
- `NativeTabs` non disegna l'intestazione: ogni tab ha il suo `Stack`, che dà il titolo e permette di aprire pagine dentro il tab (es. il futuro dettaglio `flights/[id].tsx`, con il tasto indietro e la tab bar sempre visibile).
- Ogni file in `app/` deve avere un `export default` con un componente: un file vuoto viene scartato e lo `Stack` del suo tab resta senza schermate (errore a runtime, non lo vedono né TypeScript né il bundler).

## Tema chiaro e scuro

L'app segue il tema del sistema (`userInterfaceStyle: "automatic"` in `app.json`).

- `constants/theme.ts` definisce una `Palette` per il chiaro e una per lo scuro.
- `hooks/useTheme.ts` restituisce la palette del tema attivo.
- Il layout radice passa a Expo Router il tema di navigazione (`DefaultTheme` / `DarkTheme`) con `ThemeProvider`: intestazioni e tab bar lo ricevono tramite il context, quindi i layout dei tab non lo ripetono.
- `ThemedText` è un `Text` con il colore del tema come default: lo stile passato da fuori vince.
- Gli stili che dipendono dai colori si creano con una funzione `makeStyles(colors)` dentro `useMemo`, così si ricalcolano solo quando cambia il tema.

## Perché separare `core/` dalla UI

- **Testabile:** le funzioni pure si testano con Jest senza simulatori né rendering.
- **Riutilizzabile:** la stessa logica andrà bene per Android, per un widget o per un backend futuro.
- **Pronto per il futuro:** quando arriveranno i dati dal numero di volo, cambierà solo il modo in cui viene costruito il `FlightInput`, mentre il calcolo resterà lo stesso.

Regola: `core/` non importa mai niente da `react`, `react-native` o `expo-*`.

## I dati

### Aeroporti (`airports.ts`)

Tre livelli, dal più generico al più preciso:

1. **Catalogo** (`data/airports.catalog.json`): circa 4000 aeroporti con voli di linea da [OurAirports](https://ourairports.com/), con codice IATA, nome, città, paese e dimensione (`large` / `medium` / `small`). Contiene solo l'anagrafica, senza tempi. Lo rigenera ogni mese il workflow `update-airports.yml`.
2. **Profili di default** (`DEFAULT_TERMINALS`): tempi **prudenti** per dimensione, usati per tutti gli aeroporti non calibrati. Per un aeroporto che non si conosce è meglio arrivare un po' prima, quindi un default non è mai più veloce di uno scalo calibrato della stessa dimensione.
3. **Profili calibrati** (`AIRPORT_PROFILES`): terminal e tempi specifici, per ora solo LIN, MXP e BGY (Carte dei Servizi + stime). Ogni terminal ha `source` e `verifiedAt`.

`getAirport(code)` unisce catalogo e profilo e restituisce un `Airport` con `calibrated: true/false`: la UI lo usa per avvisare quando i tempi sono stimati.

Ogni terminal ha i tempi di sicurezza per fascia oraria, banco, passaporti e cammino al gate (diverso per gate Schengen ed extra-Schengen, es. i satelliti di MXP T1).

**Terminal da compagnia:** `airlineTerminals` dice quale terminal usa una compagnia (es. easyJet a MXP → T2). `resolveTerminal` sceglie nell'ordine: il terminal indicato dall'utente, quello della compagnia, il primo dell'aeroporto.

### Compagnie (`airlines.ts`)

Per ogni compagnia: minuti di chiusura del gate e del banco prima della partenza. Il banco può chiudere a orari diversi per voli Schengen ed extra-Schengen (es. ITA 40' / 60'). `default` ("Non so / altra") usa i valori più prudenti tra le compagnie note. I tempi sono verificati sui siti delle compagnie (`source`, `verifiedAt`).

### Paesi (`countries.ts`)

`COUNTRIES` è la lista dei paesi con i nomi in italiano (`i18n-iso-countries`) e il flag `schengen`. `requiresPassportControl(origine, destinazione)` restituisce `false` per i voli nazionali e per quelli tra due paesi Schengen. Un codice sconosciuto conta come extra-Schengen (scelta prudente).

### Margini (`margins.ts`)

`DEFAULT_MARGINS`: si vuole essere al gate **15'** prima che chiuda e finire al banco **10'** prima che chiuda. `calculateTrip` accetta margini diversi come secondo parametro.

## Il modello di calcolo (`calculateTrip`)

Si ragiona **a ritroso** dall'orario del volo, nel terminal scelto con `resolveTerminal`.

1. **Vincolo gate**:
   - chiusura del gate = volo − `gateCloseMinutes` della compagnia
   - al gate entro: chiusura del gate − margine gate
   - fine dei controlli: al gate − cammino − passaporti (solo se servono)
   - inizio dei controlli: fine − durata della sicurezza
   - arrivo in aeroporto: inizio dei controlli − banco (solo se serve)
2. **Vincolo banco** (solo se serve il banco): volo − chiusura del banco − margine banco − durata del banco
3. **Arrivo in aeroporto** = il vincolo che dà l'orario **più presto** (cioè il più prudente). `bindingConstraint` dice quale ha vinto.
4. **Partenza da casa** = arrivo − minuti di viaggio
5. **Tempo libero al gate** (`buffer`): da quando si arriva al gate fino alla chiusura. Vale almeno il margine del gate, di più quando vince il banco.

**Quando serve il banco:** se c'è un bagaglio da stiva **oppure** il check-in online non è stato fatto.

**Quando servono i passaporti:** quando `requiresPassportControl` lo dice, guardando il paese dell'aeroporto di partenza e quello di destinazione.

**Durata della sicurezza:** dipende dalla fascia oraria (`earlyMorning` prima delle 8, `day` dalle 8 alle 18, `evening` dopo le 18) in cui si fa **la coda**, non dall'orario del volo. Se la coda è a cavallo tra due fasce, `securityMinutesEndingAt` tiene la durata più lunga.

### Esempio (è anche un test)

MXP T1, volo alle 10:00 per la Francia, bagaglio da stiva, check-in online fatto, compagnia non indicata (gate −30', banco −60'), 60' di viaggio:

- chiusura del gate alle 09:30, margine 15' → al gate alle **09:15**
- cammino 15' (Schengen) → controlli finiti alle 09:00
- sicurezza 25' (fascia `day`) → controlli dalle 08:35
- banco 25' → vincolo gate: arrivo alle **08:10**
- vincolo banco: chiusura alle 09:00, margine 10', banco 25' → 08:25
- vince il gate (08:10, più presto), quindi si parte da casa alle **07:10**

La timeline risultante:

| Tappa | Dalle | Alle |
| --- | --- | --- |
| Viaggio | 07:10 | 08:10 |
| Banco | 08:10 | 08:35 |
| Sicurezza | 08:35 | 09:00 |
| Cammino al gate | 09:00 | 09:15 |
| Tempo libero al gate | 09:15 | 09:30 |

### Semplificazioni consapevoli

- Le date sono in ora locale del telefono: va bene finché si parte dal fuso del telefono. Il fuso dell'aeroporto di partenza è previsto nella Fase 4.
- Quando vince il banco si arriva prima e i controlli avvengono prima del previsto, ma la fascia della sicurezza resta quella calcolata dal vincolo del gate.
- I tempi delle compagnie sono verificati sui loro siti (fa comunque fede la carta d'imbarco); quelli degli aeroporti sono **stime documentate**.

## Output: `TripPlan`

```ts
{
  leaveHomeAt: Date;
  arriveAirportAt: Date;
  terminal: TerminalId;                       // il terminal usato per il calcolo
  timeline: {                                 // in ordine, dal viaggio al tempo libero al gate
    id: StepId;                               // 'travel' | 'bagDrop' | 'security' | 'passportControl' | 'walkToGate' | 'buffer'
    startAt: Date;
    endAt: Date;
    minutes: number;
  }[];
  deadlines: {                                // scadenze da mostrare sulla timeline
    id: DeadlineId;                           // 'bagDropClose' (solo se serve il banco) | 'gateClose' | 'departure'
    at: Date;
  }[];
  bindingConstraint: 'gate' | 'bagDrop';      // quale vincolo ha deciso l'orario
}
```

La timeline non ha buchi: ogni tappa inizia dove finisce la precedente (`buildTimeline`), e l'ultima (`buffer`) finisce esattamente alla chiusura del gate. I test lo controllano per ogni caso.

`core/` restituisce degli **id** (`'security'`, `'gateClose'`…) e non delle stringhe in italiano: la traduzione la fa la UI (`STEP_LABELS` e `DEADLINE_LABELS` in `components/TripResult.tsx`). Così un domani aggiungere l'inglese non richiede di toccare la logica.

## Test

- **Logica** (`src/core/*.test.ts`): `calculateTrip` (casi normali e casi limite come mezzanotte o 0 minuti di viaggio), fasce orarie, date e controllo passaporti, catalogo, profili e terminal degli aeroporti.
- **Componenti** (`src/components/*.test.tsx`): `TripResult` con `@testing-library/react-native`.
- **Schermate** (`src/__tests__/`): il calcolatore (`HomeScreen.test.tsx`).

La CI (`ci.yml`) esegue test, typecheck, lint ed `expo-doctor` a ogni PR.
