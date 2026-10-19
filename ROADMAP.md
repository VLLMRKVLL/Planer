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
- [ ] Scegliere la licenza (consigliata MIT) e aggiungere il file `LICENSE`

## Fase 1: MVP usabile

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
- [ ] Supporto al tema scuro (`userInterfaceStyle` è su `light`)

## Fase 2: Qualità e automazione

Obiettivo: ogni modifica viene controllata in automatico, così puoi cambiare il codice senza paura.

- [ ] GitHub Actions: `npm test`, `npm run typecheck` e `npm run lint` a ogni PR
- [ ] `npx expo-doctor` pulito
- [ ] Test dei componenti con `@testing-library/react-native` (almeno il form e `TripResult`)
- [ ] Test per i casi limite di `calculateTrip` (volo a mezzanotte, viaggio di 0 minuti)

## Fase 3: Persistenza e promemoria

Obiettivo: l'app si ricorda di te e ti avvisa quando è ora di uscire.

- [ ] Salvare sul telefono le preferenze (aeroporto abituale, minuti di viaggio, compagnia)
- [ ] Salvare un volo pianificato e mostrarlo all'apertura dell'app
- [ ] Notifica locale "È ora di partire" all'orario calcolato (`expo-notifications`)
- [ ] Notifica di anticipo configurabile (es. 15 minuti prima)
- [ ] Richiede una **development build** (`eas build --profile development`): Expo Go non basta più per alcuni moduli nativi

## Fase 4: Dati reali

Obiettivo: inserire meno dati possibile e ricevere stime più precise.

- [ ] Compagnia ricavata dal numero di volo (es. `FR1234` → Ryanair)
- [ ] Scegliere un'API voli (orari, terminal, ritardi) e valutarne costi e limiti
- [ ] Compilare automaticamente il `FlightInput` a partire dal numero di volo
- [ ] Tempo di viaggio da casa stimato con il traffico (API mappe) invece che inserito a mano
- [ ] Tempi degli aeroporti caricati da remoto, per aggiornarli senza pubblicare una nuova versione
- [ ] Fuso orario dell'aeroporto di partenza (per voli che partono da un fuso diverso da quello del telefono)

## Fase 5: Pubblicazione

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

- 2026-10-19: tempi delle compagnie verificati sui siti (Ryanair gate 30' e banco 60', ITA gate 15' e banco 40'/60' Schengen/extra-Schengen), profili LIN/MXP/BGY e default per dimensione documentati, terminal da compagnia (easyJet a MXP → T2), timeline provata su iPhone, legenda della roadmap con `[w]`
- 2026-10-16: catalogo aeroporti da OurAirports con aggiornamento mensile, paese di partenza, select aeroporti, passaporti in base a origine e destinazione
- 2026-10-16: risultato come timeline con orari, buffer e scadenze; calcolo a ritroso con terminal, fascia della coda e margine sul banco
- 2026-10-13: creata questa roadmap
- 2026-10-13: Fase 0, boilerplate Expo, logica di calcolo, test e documentazione (VLLMRKVLL/Planer#1)
