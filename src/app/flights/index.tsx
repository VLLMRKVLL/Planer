import { useMemo } from "react";
import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";

export default function Flights() {
  const styles = useMemo(() => makeStyles(), []);

  return <ThemedText style={styles.label}>Nessun volo salvato</ThemedText>;
}

// Colori dalla palette: il colore normale del testo lo dà già ThemedText
function makeStyles() {
  return StyleSheet.create({
    label: { fontWeight: "600", marginTop: 8 },
  });
}
