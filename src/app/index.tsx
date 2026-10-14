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
  calculateTrip,
  type AirlineId,
  type AirportCode,
  type StepId,
} from "@/core";

import { Host, Picker } from "@expo/ui";

import { TimeWheel } from "@/components/TimeWheel";

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

// "HH:MM" → Date di oggi a quell'ora; null se il formato non è valido
function parseTime(text: string): Date | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(text.trim());
  if (!match) return null;
  const [hours, minutes] = [Number(match[1]), Number(match[2])];
  if (hours > 23 || minutes > 59) return null;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export default function HomeScreen() {
  const [airport, setAirport] = useState<AirportCode>("MXP");
  const [airline, setAirline] = useState<AirlineId>("default");
  const [flightMinutes, setFlightMinutes] = useState(0);
  const [country, setCountry] = useState("FR");
  const [hasCheckedBag, setHasCheckedBag] = useState(false);
  const [onlineCheckInDone, setOnlineCheckInDone] = useState(true);
  const [travelMinutes, setTravelMinutes] = useState("45");

  // Gestione dell'orario di partenza
  const MAX_HOURS = 20;
  const HOURS_LIST = Array.from({ length: MAX_HOURS + 1 }, (_, h) => h);
  const MINUTES_LIST = Array.from({ length: 12 }, (_, i) => i * 5);

  const hours = Math.floor((flightMinutes ?? 0) / 60);
  const minutes = (flightMinutes ?? 0) % 60;

  const timeString = hours + ":" + minutes;

  // Ricalcolo a ogni render: la funzione è pura e velocissima, non serve un bottone
  const departureTime = parseTime(timeString);
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
      <Host matchContents>
        <Picker selectedValue={airline} onValueChange={(id) => setAirline(id)}>
          {Object.values(AIRLINES).map((a) => (
            <Picker.Item key={a.id} label={a.name} value={a.id} />
          ))}
        </Picker>
      </Host>

      <Text style={styles.label}>Orario del volo (HH:MM)</Text>
      <TimeWheel valueMinutes={flightMinutes} onChange={setFlightMinutes} />

      <Text style={styles.label}>Paese di destinazione (es. FR, GB, US)</Text>
      <TextInput
        style={styles.input}
        value={country}
        onChangeText={setCountry}
        autoCapitalize="characters"
        maxLength={2}
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
  durationWheel: { flex: 1, minWidth: 0, height: 40, maxWidth: 130 },
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
