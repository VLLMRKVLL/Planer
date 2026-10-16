import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from "react-native";

import {
  AIRLINES,
  COUNTRIES,
  calculateTrip,
  getAirport,
  getAirportsByCountry,
  type AirlineId,
  type AirportCode,
  type DeadlineId,
  type StepId,
  type TerminalId,
} from "@/core";

import { Host } from "@expo/ui";
import { DatePicker } from "@expo/ui/swift-ui";
import { datePickerStyle } from "@expo/ui/swift-ui/modifiers";

import { Chips } from "@/components/Chips";
import { Select } from "@/components/Select";

// Etichette in italiano per le tappe (la UI traduce, core/ resta neutro)
const STEP_LABELS: Record<StepId, string> = {
  travel: "Viaggio da casa",
  bagDrop: "Banco / drop bagagli",
  security: "Controlli di sicurezza",
  passportControl: "Controllo passaporti",
  walkToGate: "Cammino al gate",
  buffer: "Tempo libero al gate",
};

const DEADLINE_LABELS: Record<DeadlineId, string> = {
  bagDropClose: "Chiusura banco",
  gateClose: "Chiusura gate",
  departure: "Partenza",
};

const formatTime = (d: Date) =>
  d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });

// Paesi di partenza: solo quelli con almeno un aeroporto nel catalogo
const ORIGIN_COUNTRIES = COUNTRIES.filter(
  (c) => getAirportsByCountry(c.id).length > 0,
);

// Primo terminal di un aeroporto (i codici arrivano dal catalogo, quindi esiste)
const firstTerminalOf = (code: AirportCode): TerminalId =>
  getAirport(code)?.terminals[0].id ?? "T1";

export default function HomeScreen() {
  const [originCountry, setOriginCountry] = useState("IT");
  const [airport, setAirport] = useState<AirportCode>("MXP");
  const [terminal, setTerminal] = useState<TerminalId>(firstTerminalOf("MXP"));
  const [airline, setAirline] = useState<AirlineId>("default");
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
          terminal: terminal
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
    setTerminal(firstTerminalOf(code));
  };

  // Cambiando paese si passa al primo aeroporto di quel paese
  const changeOriginCountry = (countryCode: string) => {
    setOriginCountry(countryCode);
    const first = getAirportsByCountry(countryCode)[0];
    if (first) changeAirport(first.code);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Paese di partenza</Text>
      <Select
        options={ORIGIN_COUNTRIES}
        value={originCountry}
        onChange={changeOriginCountry}
      />

      <Text style={styles.label}>Aeroporto</Text>
      <Select
        options={airportOptions}
        value={airport}
        onChange={changeAirport}
      />
      {selectedAirport && !selectedAirport.calibrated && (
        <Text style={styles.note}>
          Tempi stimati: questo aeroporto non è ancora calibrato.
        </Text>
      )}

      {terminals.length > 1 && (
        <>
          <Text style={styles.label}>Terminal</Text>
          <Chips
            options={terminals.map((t) => ({ id: t.id, name: t.name }))}
            value={terminal}
            onChange={setTerminal}
          />
        </>
      )}

      <Text style={styles.label}>Compagnia</Text>
      <Select
        options={Object.values(AIRLINES)}
        value={airline}
        onChange={setAirline}
      />

      <Text style={styles.label}>Orario del volo</Text>
      <Host matchContents>
        <DatePicker
          selection={departureTime}
          onDateChange={setDepartureTime}
          displayedComponents={["hourAndMinute"]}
          modifiers={[datePickerStyle("wheel")]}
        />
      </Host>

      <Text style={styles.label}>Paese di destinazione</Text>
      <Select
        options={COUNTRIES}
        value={country}
        onChange={setCountry}
      />

      <Text style={styles.label}>Minuti di viaggio da casa</Text>
      <TextInput
        style={styles.input}
        value={travelMinutes}
        onChangeText={setTravelMinutes}
        keyboardType="number-pad"
      />

      <View style={styles.switchRow}>
        <Text>Bagaglio da stiva</Text>
        <Switch value={hasCheckedBag} onValueChange={setHasCheckedBag} />
      </View>
      <View style={styles.switchRow}>
        <Text>Check-in online fatto</Text>
        <Switch
          value={onlineCheckInDone}
          onValueChange={setOnlineCheckInDone}
        />
      </View>

      {plan ? (
        <View style={styles.result}>
          <Text style={styles.big}>
            Parti da casa alle {formatTime(plan.leaveHomeAt)}
          </Text>
          <Text style={styles.big}>
            Arriva in aeroporto alle {formatTime(plan.arriveAirportAt)}
          </Text>

          <View style={styles.timeline}>
            {plan.timeline.map((step) => (
              <View key={step.id} style={styles.timelineRow}>
                <Text style={styles.time}>
                  {formatTime(step.startAt)}–{formatTime(step.endAt)}
                </Text>
                <Text style={styles.stepLabel}>{STEP_LABELS[step.id]}</Text>
                <Text style={styles.stepMinutes}>{step.minutes} min</Text>
              </View>
            ))}
          </View>

          <View style={styles.timeline}>
            {plan.deadlines.map((deadline) => (
              <View key={deadline.id} style={styles.timelineRow}>
                <Text style={styles.time}>{formatTime(deadline.at)}</Text>
                <Text style={styles.stepLabel}>{DEADLINE_LABELS[deadline.id]}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.note}>
            Vincolo decisivo:{" "}
            {plan.bindingConstraint === "gate"
              ? "chiusura gate"
              : "chiusura banco bagagli"}
          </Text>
        </View>
      ) : (
        <Text style={styles.note}>
          Compila i campi per vedere il risultato.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
  label: { fontWeight: "600", marginTop: 8 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10 },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  result: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#EEF6FF",
    gap: 4,
  },
  big: { fontSize: 18, fontWeight: "700" },
  timeline: { marginTop: 8, gap: 6 },
  timelineRow: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  time: { width: 100, fontVariant: ["tabular-nums"], fontWeight: "600" },
  stepLabel: { flex: 1 },
  stepMinutes: { color: "#666", fontVariant: ["tabular-nums"] },
  note: { marginTop: 8, color: "#666" },
});
