import {
  AIRPORT_CATALOG,
  CALIBRATED_AIRPORT_CODES,
  getAirport,
  getAirportsByCountry,
  resolveTerminal,
} from './airports';

describe('airport catalog', () => {
  it('has unique, well-formed IATA codes', () => {
    const codes = AIRPORT_CATALOG.map((a) => a.code);
    expect(new Set(codes).size).toBe(codes.length);
    for (const code of codes) expect(code).toMatch(/^[A-Z]{3}$/);
  });

  it('contains every calibrated airport', () => {
    // Se un codice in AIRPORT_PROFILES è sbagliato, il profilo non verrebbe mai usato
    for (const code of CALIBRATED_AIRPORT_CODES) {
      expect(getAirport(code)?.calibrated).toBe(true);
    }
  });

  it('keeps calibrated profiles consistent', () => {
    for (const code of CALIBRATED_AIRPORT_CODES) {
      const ids = getAirport(code)!.terminals.map((t) => t.id);
      expect(new Set(ids).size).toBe(ids.length); // nessun terminal doppio
    }
  });

  it('maps airlines only to terminals that exist', () => {
    for (const code of CALIBRATED_AIRPORT_CODES) {
      const airport = getAirport(code)!;
      const ids = airport.terminals.map((t) => t.id);
      for (const terminal of Object.values(airport.airlineTerminals)) {
        expect(ids).toContain(terminal);
      }
    }
  });
});

describe('getAirport', () => {
  it('returns calibrated terminals for the Milan airports', () => {
    const mxp = getAirport('MXP');
    expect(mxp?.country).toBe('IT');
    expect(mxp?.calibrated).toBe(true);
    expect(mxp?.terminals.map((t) => t.id)).toEqual(['T1', 'T2']);
  });

  it('uses a default profile for airports that are not calibrated', () => {
    const fco = getAirport('FCO');
    expect(fco?.calibrated).toBe(false);
    expect(fco?.terminals).toHaveLength(1);
    expect(fco?.terminals[0].source).toMatch(/profilo generico/);
  });

  it('ignores case and spaces', () => {
    expect(getAirport(' lin ')?.code).toBe('LIN');
  });

  it('returns undefined for unknown codes', () => {
    expect(getAirport('ZZZ')).toBeUndefined();
  });
});

describe('getAirportsByCountry', () => {
  it('lists the airports of a country sorted by name', () => {
    const italian = getAirportsByCountry('IT');
    expect(italian.every((a) => a.country === 'IT')).toBe(true);
    expect(italian.map((a) => a.code)).toEqual(expect.arrayContaining(['LIN', 'MXP', 'BGY']));
    const names = italian.map((a) => a.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it('returns an empty list for a country without airports', () => {
    expect(getAirportsByCountry('XX')).toEqual([]);
  });
});

describe('resolveTerminal', () => {
  it('uses the chosen terminal or falls back to the first one', () => {
    const mxp = getAirport('MXP')!;
    expect(resolveTerminal(mxp, 'T2').id).toBe('T2');
    expect(resolveTerminal(mxp).id).toBe('T1');
    expect(resolveTerminal(getAirport('LIN')!, 'T2').id).toBe('T1');
  });

  it('uses the terminal of the airline when none is chosen', () => {
    const mxp = getAirport('MXP')!;
    expect(resolveTerminal(mxp, undefined, 'easyjet').id).toBe('T2');
    expect(resolveTerminal(mxp, 'T1', 'easyjet').id).toBe('T1'); // vince la scelta
    expect(resolveTerminal(mxp, undefined, 'ita').id).toBe('T1');
    // Aeroporto senza mappa delle compagnie → primo terminal
    expect(resolveTerminal(getAirport('LIN')!, undefined, 'easyjet').id).toBe('T1');
  });
});
