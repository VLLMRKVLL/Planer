# 2. Architettura e modello di calcolo

## Struttura

```
src/
  app/                 ← SOLO schermate (Expo Router: ogni file = una route)
    _layout.tsx        ← layout radice (uno Stack con titolo "Planer")
    index.tsx          ← schermata principale: form + risultato
  core/                ← logica pura, zero React
    types.ts           ← tipi condivisi
    airports.ts        ← tempi per aeroporto e terminal per compagnia (stime documentate)
    airlines.ts        ← chiusura gate / banco per compagnia (verificati sui siti)
    schengen.ts        ← paesi Schengen (ISO alpha-2)
    utils.ts           ← getTimeSlot, requiresPassportControl, subtractMinutes
    calculateTrip.ts   ← la funzione di calcolo principale
    index.ts           ← "barrel": l'API pubblica di core/
    *.test.ts          ← test Jest accanto al file che testano
```

**Nota:** nel piano originale `core/` stava nella root. Il template SDK 57 però mette tutto il codice in `src/` e definisce l'alias `@/*` → `./src/*`, quindi ho messo la logica in `src/core/`. La UI la importa con `import { calculateTrip } from '@/core'`.

## Perché separare `core/` dalla UI

- **Testabile:** le funzioni pure si testano con Jest senza simulatori né rendering.
- **Riutilizzabile:** la stessa logica andrà bene per Android, per un widget o per un backend futuro.
- **Pronto per il futuro:** quando arriveranno i dati dal numero di volo, cambierà solo il modo in cui viene costruito il `FlightInput`, mentre il calcolo resterà lo stesso.

Regola: `core/` non importa mai niente da `react`, `react-native` o `expo-*`.

## Il modello di calcolo (`calculateTrip`)

Si ragiona **a ritroso** dall'orario del volo.

1. Si costruiscono le tappe in aeroporto, in ordine:
   - banco/drop bagagli, **solo se** c'è un bagaglio da stiva **oppure** il check-in online non è stato fatto
   - sicurezza, con un tempo che dipende dalla fascia oraria
   - controllo passaporti, **solo se** la destinazione è extra-Schengen
   - cammino al gate
   - margine (15 min, `SAFETY_MARGIN_MINUTES`)
2. **Vincolo gate:** `volo − chiusuraGate − somma(tappe)`
3. **Vincolo banco** (solo se serve il banco): `volo − chiusuraBanco − tempoBanco`. Alcune compagnie (es. ITA) chiudono il banco prima per i voli extra-Schengen
4. **Arrivo in aeroporto** = il vincolo che dà l'orario **più presto** (cioè il più prudente)
5. **Partenza da casa** = arrivo − minuti di viaggio

### Esempio (è anche un test)

MXP, volo alle 10:00 per la Francia, bagaglio da stiva, compagnia non indicata (default: gate −30, banco −60):

- tappe: banco 25 + sicurezza 25 (fascia `day`) + cammino 15 + margine 15 = 80'
- vincolo gate: 30 + 80 = 110' → **08:10**
- vincolo banco: 60 + 25 = 85' → 08:35
- vince il gate (08:10), quindi con 60' di viaggio si parte da casa alle **07:10**

### Semplificazioni consapevoli dell'MVP

- La fascia oraria si calcola dall'orario **del volo**, non dall'ora in cui si passa davvero la sicurezza.
- Le date sono in ora locale del telefono (va bene finché gli aeroporti sono tutti in Italia).
- I tempi delle compagnie sono verificati sui loro siti; quelli degli aeroporti sono **stime documentate** (`source` e `verifiedAt` in `airports.ts`).

## Output: `TripPlan`

```ts
{
  leaveHomeAt: Date;
  arriveAirportAt: Date;
  steps: { id: StepId; minutes: number }[]; // in ordine cronologico, viaggio incluso
  bindingConstraint: 'gate' | 'bagDrop';    // quale vincolo ha deciso l'orario
}
```

`core/` restituisce degli **id** (`'security'`, `'bagDrop'`…) e non delle stringhe in italiano: la traduzione la fa la UI (`STEP_LABELS` in `index.tsx`). Così un domani aggiungere l'inglese non richiede di toccare la logica.
