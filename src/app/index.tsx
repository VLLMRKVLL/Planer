import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Switch, TextInput, View } from "react-native";

import {
  AIRLINES,
  COUNTRIES,
  calculateTrip,
  getAirport,
  getAirportsByCountry,
  resolveTerminal,
  type AirlineId,
  type AirportCode,
  type TerminalId,
} from "@/core";

import { Host } from "@expo/ui";
import { DatePicker } from "@expo/ui/swift-ui";
import { datePickerStyle } from "@expo/ui/swift-ui/modifiers";

import { Chips } from "@/components/Chips";
import { Select } from "@/components/Select";
import { ThemedText } from "@/components/ThemedText";
import { TripResult } from "@/components/TripResult";

import type { Palette } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

// Paesi di partenza: solo quelli con almeno un aeroporto nel catalogo
const ORIGIN_COUNTRIES = COUNTRIES.filter(
  (c) => getAirportsByCountry(c.id).length > 0,
);

// Terminal proposto: quello della compagnia (es. easyJet a MXP → T2), altrimenti il primo
const defaultTerminalOf = (
  code: AirportCode,
  airline: AirlineId,
): TerminalId => {
  const airport = getAirport(code);
  return airport ? resolveTerminal(airport, undefined, airline).id : "T1";
};

export default function HomeScreen() {
  const colors = useTheme();
  // Gli stili si ricalcolano solo quando cambia il tema, non a ogni render
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [originCountry, setOriginCountry] = useState("IT");
  const [airport, setAirport] = useState<AirportCode>("MXP");
  const [airline, setAirline] = useState<AirlineId>("default");
  const [terminal, setTerminal] = useState<TerminalId>(
    defaultTerminalOf("MXP", "default"),
  );
  const [departureTime, setDepartureTime] = useState(new Date());
  const [country, setCountry] = useState("IT");
  const [hasCheckedBag, setHasCheckedBag] = useState(false);
  const [onlineCheckInDone, setOnlineCheckInDone] = useState(true);
  const [travelMinutes, setTravelMinutes] = useState("45");

  // Ricalcolo a ogni render: la funzione è pura e velocissima, non serve un bottone
  const travel = Number(travelMinutes);
  const plan =
    departureTime && Number.isFinite(travel) && country.trim().length === 2
      ? calculateTrip({
          airport,
          departureTime,
          destinationCountry: country,
          hasCheckedBag,
          onlineCheckInDone,
          travelTimeMinutes: travel,
          airline: airline,
          terminal: terminal,
        })
      : null;

  const airportOptions = getAirportsByCountry(originCountry).map((a) => ({
    id: a.code,
    name: `${a.name} (${a.code})`,
  }));
  const selectedAirport = getAirport(airport);
  const terminals = selectedAirport?.terminals ?? [];

  // Cambiando aeroporto il terminal precedente potrebbe non esistere: si riparte dal primo
  const changeAirport = (code: AirportCode) => {
    setAirport(code);
    setTerminal(defaultTerminalOf(code, airline));
  };

  // Cambiando compagnia si propone il suo terminal (l'utente può comunque cambiarlo)
  const changeAirline = (id: AirlineId) => {
    setAirline(id);
    setTerminal(defaultTerminalOf(airport, id));
  };

  // Cambiando paese si passa al primo aeroporto di quel paese
  const changeOriginCountry = (countryCode: string) => {
    setOriginCountry(countryCode);
    const first = getAirportsByCountry(countryCode)[0];
    if (first) changeAirport(first.code);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText style={styles.label}>Paese di partenza</ThemedText>
      <Select
        options={ORIGIN_COUNTRIES}
        value={originCountry}
        onChange={changeOriginCountry}
      />

      <ThemedText style={styles.label}>Aeroporto</ThemedText>
      <Select
        options={airportOptions}
        value={airport}
        onChange={changeAirport}
      />
      {selectedAirport && !selectedAirport.calibrated && (
        <ThemedText style={styles.note}>
          Tempi stimati: questo aeroporto non è ancora calibrato.
        </ThemedText>
      )}

      {terminals.length > 1 && (
        <>
          <ThemedText style={styles.label}>Terminal</ThemedText>
          <Chips
            options={terminals.map((t) => ({ id: t.id, name: t.name }))}
            value={terminal}
            onChange={setTerminal}
          />
        </>
      )}

      <ThemedText style={styles.label}>Compagnia</ThemedText>
      <Select
        options={Object.values(AIRLINES)}
        value={airline}
        onChange={changeAirline}
      />

      <ThemedText style={styles.label}>Orario del volo</ThemedText>
      <Host matchContents>
        <DatePicker
          selection={departureTime}
          onDateChange={setDepartureTime}
          displayedComponents={["hourAndMinute"]}
          modifiers={[datePickerStyle("wheel")]}
        />
      </Host>

      <ThemedText style={styles.label}>Paese di destinazione</ThemedText>
      <Select options={COUNTRIES} value={country} onChange={setCountry} />

      <ThemedText style={styles.label}>Minuti di viaggio da casa</ThemedText>
      <TextInput
        style={styles.input}
        value={travelMinutes}
        onChangeText={setTravelMinutes}
        keyboardType="number-pad"
      />

      <View style={styles.switchRow}>
        <ThemedText>Bagaglio da stiva</ThemedText>
        <Switch value={hasCheckedBag} onValueChange={setHasCheckedBag} />
      </View>
      <View style={styles.switchRow}>
        <ThemedText>Check-in online fatto</ThemedText>
        <Switch
          value={onlineCheckInDone}
          onValueChange={setOnlineCheckInDone}
        />
      </View>

      {plan ? (
        <TripResult plan={plan} />
      ) : (
        <ThemedText style={styles.note}>
          Compila i campi per vedere il risultato.
        </ThemedText>
      )}
    </ScrollView>
  );
}

// Colori dalla palette: il colore normale del testo lo dà già ThemedText
function makeStyles(colors: Palette) {
  return StyleSheet.create({
    container: { padding: 16, gap: 8 },
    label: { fontWeight: "600", marginTop: 8 },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 10,
      // TextInput non è un Text: il colore va dato a mano
      color: colors.text,
    },
    switchRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    note: { marginTop: 8, color: colors.textMuted },
  });
}
