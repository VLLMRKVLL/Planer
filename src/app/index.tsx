import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  AIRLINES,
  AIRPORTS,
  COUNTRIES,
  calculateTrip,
  type AirlineId,
  type AirportCode,
  type StepId,
} from "@/core";

import { Host } from "@expo/ui";
import { DatePicker } from "@expo/ui/swift-ui";
import { datePickerStyle } from "@expo/ui/swift-ui/modifiers";

import { Select } from "@/components/Select";

// Etichette in italiano per le tappe (la UI traduce, core/ resta neutro)
const STEP_LABELS: Record<StepId, string> = {
  travel: "Viaggio da casa",
  bagDrop: "Banco / drop bagagli",
  security: "Controlli di sicurezza",
  passportControl: "Controllo passaporti",
  walkToGate: "Cammino al gate",
  margin: "Margine",
};

const formatTime = (d: Date) =>
  d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });

export default function HomeScreen() {
  const [airport, setAirport] = useState<AirportCode>("MXP");
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
        })
      : null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Aeroporto</Text>
      <View style={styles.row}>
        {Object.values(AIRPORTS).map((a) => (
          <Pressable
            key={a.code}
            onPress={() => setAirport(a.code)}
            style={[styles.chip, airport === a.code && styles.chipActive]}
          >
            <Text style={airport === a.code && styles.chipTextActive}>
              {a.code}
            </Text>
          </Pressable>
        ))}
      </View>

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
        options={Object.values(COUNTRIES)}
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
          {plan.steps.map((step) => (
            <Text key={step.id}>
              {STEP_LABELS[step.id]}: {step.minutes} min
            </Text>
          ))}
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
  row: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#208AEF",
  },
  chipActive: { backgroundColor: "#208AEF" },
  chipTextActive: { color: "white" },
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
  note: { marginTop: 8, color: "#666" },
});
