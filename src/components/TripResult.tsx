import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "./ThemedText";

import type { Palette } from "@/constants/theme";
import type { DeadlineId, StepId, TripPlan } from "@/core";
import { useTheme } from "@/hooks/useTheme";

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

// Risultato del calcolo: orari principali, timeline delle tappe e scadenze
export function TripResult({ plan }: { plan: TripPlan }) {
  const colors = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.result}>
      <ThemedText style={styles.big}>
        Parti da casa alle {formatTime(plan.leaveHomeAt)}
      </ThemedText>
      <ThemedText style={styles.big}>
        Arriva in aeroporto alle {formatTime(plan.arriveAirportAt)}
      </ThemedText>

      <View style={styles.timeline}>
        {plan.timeline.map((step) => (
          <View key={step.id} style={styles.timelineRow}>
            <ThemedText style={styles.time}>
              {formatTime(step.startAt)}–{formatTime(step.endAt)}
            </ThemedText>
            <ThemedText style={styles.stepLabel}>
              {STEP_LABELS[step.id]}
            </ThemedText>
            <ThemedText style={styles.stepMinutes}>
              {step.minutes} min
            </ThemedText>
          </View>
        ))}
      </View>

      <View style={styles.timeline}>
        {plan.deadlines.map((deadline) => (
          <View key={deadline.id} style={styles.timelineRow}>
            <ThemedText style={styles.time}>
              {formatTime(deadline.at)}
            </ThemedText>
            <ThemedText style={styles.stepLabel}>
              {DEADLINE_LABELS[deadline.id]}
            </ThemedText>
          </View>
        ))}
      </View>

      <ThemedText style={styles.note}>
        Vincolo decisivo:{" "}
        {plan.bindingConstraint === "gate"
          ? "chiusura gate"
          : "chiusura banco bagagli"}
      </ThemedText>
    </View>
  );
}

function makeStyles(colors: Palette) {
  return StyleSheet.create({
    result: {
      marginTop: 16,
      padding: 16,
      borderRadius: 12,
      backgroundColor: colors.card,
      gap: 4,
    },
    big: { fontSize: 18, fontWeight: "700" },
    timeline: { marginTop: 8, gap: 6 },
    timelineRow: { flexDirection: "row", alignItems: "baseline", gap: 8 },
    time: { width: 100, fontVariant: ["tabular-nums"], fontWeight: "600" },
    stepLabel: { flex: 1 },
    stepMinutes: { color: colors.textMuted, fontVariant: ["tabular-nums"] },
    note: { marginTop: 8, color: colors.textMuted },
  });
}
