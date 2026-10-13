# 3. Decisioni, punti aperti ed esercizi

## Decisione sulla compagnia aerea

Ho implementato **entrambe le opzioni insieme**: `airline` è un campo **opzionale** di `FlightInput`.

- Se manca, si usano valori prudenti (`default`: gate −30', banco −60').
- Se c'è, si usano i valori della compagnia (`airlines.ts`: ITA, Ryanair, easyJet, Wizz Air).

Perché: l'MVP funziona già senza chiedere la compagnia, e aggiungerla alla UI è un passo piccolo, senza riscritture. Inoltre, quando arriverà il numero di volo, la compagnia sarà nel codice stesso (es. `FR` = Ryanair).

⚠️ I valori di `airlines.ts` sono **stime da verificare** sui siti delle compagnie. Quelli di ITA (banco −60') li ho scelti apposta per avere un caso in cui il vincolo decisivo è il banco, così il test copre quel ramo.

## Scelte fatte nella UI (provvisorie)

- L'orario del volo si inserisce come testo `HH:MM`, perché un date picker vero (`@react-native-community/datetimepicker`) è un passo successivo.
- Il paese si inserisce come codice ISO a 2 lettere. Sarebbe meglio una lista con ricerca.
- Il risultato si ricalcola a ogni modifica, senza bottone "Calcola": la funzione è pura e istantanea.

## Esercizi per te (in ordine di difficoltà)

1. **Leggi `calculateTrip.test.ts`** e rifai a mano il conto del secondo test (LIN, 18:30, GB). Torna?
2. **Aggiungi un test:** volo alle 07:59 da BGY. Quale tempo di sicurezza deve usare? Scrivi prima il test e poi verifica.
3. **Aggiungi la compagnia nella UI:** una riga di "chip" come per gli aeroporti, letta da `AIRLINES`. Suggerimento: guarda come è fatto il selettore aeroporto in `index.tsx`.
4. **Validazione:** cosa succede se i minuti di viaggio sono negativi? Decidi tu se il controllo va fatto in `core/` o nella UI, e motiva la scelta.
5. **Estrai un componente:** sposta il blocco del risultato in `src/components/TripResult.tsx`, che riceve `plan` come prop.

## Prossimi passi

I prossimi passi, compresi gli esercizi qui sopra, sono nella [roadmap](../ROADMAP.md), dove si segnano man mano che li completi.
