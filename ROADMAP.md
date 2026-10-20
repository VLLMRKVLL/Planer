# Roadmap di Planer

La roadmap è divisa in **fasi**: ogni fase finisce con un risultato che si può provare sull'iPhone. Dentro una fase l'ordine dei passi è indicativo, ma conviene chiudere una fase prima di aprire la successiva.

## Come si segnano i passaggi

Ogni passo è una casella di controllo Markdown. GitHub la mostra come una checkbox vera e aggiorna il contatore di avanzamento.

| Segno             | Significato                                |
| ----------------- | ------------------------------------------ |
| `- [ ]`           | da fare                                    |
| `- [w]`           | in corso (al massimo 1–2 passi alla volta) |
| `- [x]`           | fatto                                      |
| `- [ ] ~~testo~~` | scartato (scrivi anche il motivo)          |

Il flusso per ogni passo:

1. Metti `[w]` sul passo e crea un branch (es. `feat/scelta-compagnia`).
2. Quando il lavoro è finito, nello **stesso commit** (o nella stessa PR) cambi `[w]` in `[x]` e aggiungi una riga al [Diario](#diario).
3. Se scopri un lavoro nuovo, aggiungilo come passo nella fase giusta invece di farlo "di passaggio".

Così la roadmap resta sempre allineata al codice: basta guardare la cronologia di git (`git log -p ROADMAP.md`) per sapere quando è stato chiuso ogni passo.

---

## Fase 0: Fondamenta ✅

Obiettivo: un progetto che parte, con la logica di calcolo testata e documentata.

- [x] Progetto Expo SDK 57 con Expo Router e TypeScript, demo del template rimossa
- [x] Logica pura in `src/core/` (`calculateTrip`, aeroporti, compagnie, Schengen)
- [x] Test Jest della logica (10/10)
- [x] Schermata unica con form e risultato
- [x] Documentazione in `docs/`
- [x] PR iniziale mergiata
- [x] Primo `npm run lint` in locale (installa `eslint-config-expo`) e correzione degli eventuali errori
- [x] Scegliere la licenza (MIT) e aggiungere il file `LICENSE`

## Fase 1: MVP usabile ✅

Obiettivo: un'app che useresti davvero prima di un volo, senza dover scrivere codici e orari a mano.

- [x] Selettore della compagnia aerea nella UI ("chip" letti da `AIRLINES`)
- [x] Selettore della compagnia come picker

**Input più comodi**

- [x] Date/time picker per data e ora del volo, al posto del testo `HH:MM`
- [x] Scelta del paese da una lista con ricerca, al posto del codice ISO

**Dati e presentazione**

- [x] Catalogo di tutti gli aeroporti con voli di linea (OurAirports), aggiornato ogni mese da GitHub Actions
- [x] Paese di partenza e select dell'aeroporto filtrata per paese
- [x] Controllo passaporti in base a partenza e destinazione (non più solo dall'Italia)
- [x] Calibrare i tempi di `AIRPORT_PROFILES` (fonti: Carte dei Servizi degli aeroporti, siti, esperienza personale)
- [x] Rivedere i tempi generici di `DEFAULT_TERMINALS` per aeroporti grandi, medi e piccoli
- [x] Terminal da compagnia (`airlineTerminals`, es. easyJet a MXP → T2)
- [x] Verificare i tempi di `airlines.ts` sui siti delle compagnie
- [x] Risultato come timeline (ora di ogni tappa, non solo i minuti), provata su iPhone
- [x] Supporto al tema scuro

## Fase 2: Qualità e automazione ✅

Obiettivo: ogni modifica viene controllata in automatico, così puoi cambiare il codice senza paura.

- [x] GitHub Actions: `npm test`, `npm run typecheck` e `npm run lint` a ogni PR
- [x] `npx expo-doctor` pulito (e controllato dalla CI)
- [x] Test dei componenti con `@testing-library/react-native` (almeno il form e `TripResult`)
- [x] Test per i casi limite di `calculateTrip` (volo a mezzanotte, viaggio di 0 minuti)

## Fase 3: I miei voli

Obiettivo: una UI tutta mia, i voli salvati sul telefono e un avviso quando è ora di uscire.

**Navigazione e UI**

- [x] Navigazione a tab: "Calcola" e "I miei voli"
- [w] Rivedere la pagina "Calcola" con una UI mia (stile, componenti, gerarchia delle informazioni)

**Voli salvati (sul telefono)**

- [ ] Data oltre all'ora nel picker del volo
- [ ] Compagnia ricavata dal prefisso del numero di volo (es. `FR1234` → Ryanair), senza API
- [ ] Repository dei voli in locale (`list`, `save`, `remove`), con `id` univoco e `updatedAt` per la futura sincronizzazione e lo stato "dati completi" o "in attesa di dati"
- [ ] Pagina "Aggiungi volo" (numero e data) e pagina di dettaglio del volo con il calcolo

**Promemoria**

- [ ] Notifica locale "È ora di partire" per i voli salvati (`expo-notifications`)
- [ ] Notifica di anticipo configurabile (es. 15 minuti prima)
- [ ] **Development build** (`eas build --profile development`), se Expo Go non basta per i moduli nativi
- [ ] Salvare sul telefono le preferenze (aeroporto abituale, minuti di viaggio, compagnia)

## Fase 4: Dati reali

Obiettivo: inserire solo numero di volo e data, il resto arriva in automatico. Per ora con il **piano gratuito** dell'API.

- [ ] Provare AeroDataBox con il piano gratuito: quali date future restituisce, quante unità costa una chiamata
- [ ] Proxy su Supabase Edge Function: la chiave API resta sul server, mai nell'app
- [ ] Compilare il volo dal numero di volo con "recupera quando disponibile": se l'API non ha ancora i dati il volo resta in attesa e si riprova in automatico quando si avvicina
- [ ] Fuso orario dell'aeroporto di partenza (l'API restituisce l'ora locale dell'aeroporto)
- [ ] Aggiornare orario e terminal vicino alla partenza (es. il giorno prima e qualche ora prima)
- [ ] Tempo di viaggio da casa stimato con il traffico (API mappe) invece che inserito a mano
- [ ] Tempi degli aeroporti caricati da remoto, per aggiornarli senza pubblicare una nuova versione

## Fase 5: Account

Obiettivo: i tuoi voli ti seguono su ogni dispositivo.

- [ ] Login con Supabase Auth
- [ ] Repository dei voli su Supabase, sincronizzato con quello locale (`id` e `updatedAt` già pronti dalla Fase 3)

## Fase 6: Pubblicazione

Obiettivo: l'app è su TestFlight e poi sull'App Store.

- [ ] Icona e splash screen definitivi
- [ ] Account Apple Developer e configurazione di EAS (`eas.json`)
- [ ] Build di produzione con `eas build --platform ios`
- [ ] Distribuzione su TestFlight a qualche amico per avere un riscontro
- [ ] Privacy policy e scheda dell'App Store (screenshot, descrizione)
- [ ] Invio con `eas submit` e aggiornamenti OTA con `eas update`

---

## Idee per dopo (non pianificate)

Le idee arrivano qui prima di entrare in una fase.

- Versione in inglese (le etichette sono già separate in `STEP_LABELS`)
- Widget iOS con l'orario di partenza
- Supporto Android
- Aggiunta del volo al calendario

## Diario

Una riga per ogni passo chiuso, la più recente in alto. Formato: `AAAA-MM-GG: cosa è stato fatto (PR o commit)`.

- 2026-10-21: navigazione a tab con `NativeTabs` (tab bar nativa di iOS, icone SF Symbols): tab "Calcolatore" nel gruppo `(calculator)` sulla route `/` e tab "I miei voli" in `flights/` con un segnaposto, uno `Stack` per tab per il titolo e le future pagine di dettaglio; test aggiornato al nuovo percorso; `docs/02-architettura.md` riscritto e allineato al codice
- 2026-10-21: riorganizzata la roadmap: Fase 3 "I miei voli" (tab, UI propria della pagina Calcola, voli salvati in locale, notifiche), Fase 4 dati reali dal numero di volo con piano gratuito e proxy Supabase, nuova Fase 5 account, pubblicazione spostata in Fase 6
- 2026-10-20: Fase 2 completata: workflow CI (`.github/workflows/ci.yml`) con test, typecheck, lint ed `expo-doctor` a ogni PR e dopo ogni merge su `main`, Node 24 da `.nvmrc`; test dei casi limite di `calculateTrip` (mezzanotte, alba, 0 minuti); risultato estratto in `TripResult` e test dei componenti con `@testing-library/react-native` (53 test)
- 2026-10-20: licenza MIT (file `LICENSE`, campo `license` in `package.json`, sezione nel README); chiusa la Fase 0
- 2026-10-20: tema scuro che segue il sistema (`userInterfaceStyle: "automatic"`): palette chiara/scura in `constants/theme.ts`, hook `useTheme`, tema di navigazione in `_layout.tsx`, componente `ThemedText`, stili da `makeStyles` con `useMemo`; provato su iPhone
- 2026-10-19: tempi delle compagnie verificati sui siti (Ryanair gate 30' e banco 60', ITA gate 15' e banco 40'/60' Schengen/extra-Schengen), profili LIN/MXP/BGY e default per dimensione documentati, terminal da compagnia (easyJet a MXP → T2), timeline provata su iPhone, legenda della roadmap con `[w]`
- 2026-10-16: catalogo aeroporti da OurAirports con aggiornamento mensile, paese di partenza, select aeroporti, passaporti in base a origine e destinazione
- 2026-10-16: risultato come timeline con orari, buffer e scadenze; calcolo a ritroso con terminal, fascia della coda e margine sul banco
- 2026-10-13: creata questa roadmap
- 2026-10-13: Fase 0, boilerplate Expo, logica di calcolo, test e documentazione (VLLMRKVLL/Planer#1)
