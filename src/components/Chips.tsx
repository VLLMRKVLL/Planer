import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import type { SelectOption } from "./Select";
import { ThemedText } from "./ThemedText";

import type { Palette } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

type ChipsProps<T extends string> = {
  options: readonly SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

// Scelta singola a "chip": stesse props di Select, ma tutte le opzioni restano visibili
export function Chips<T extends string>({
  options,
  value,
  onChange,
}: ChipsProps<T>) {
  const colors = useTheme();
  // Gli stili si ricalcolano solo quando cambia il tema
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      {options.map((o) => {
        const active = o.id === value;
        return (
          <Pressable
            key={o.id}
            onPress={() => onChange(o.id)}
            style={[styles.chip, active && styles.chipActive]}
          >
            {/* Il colore normale arriva da ThemedText, l'attivo lo sovrascrive */}
            <ThemedText style={active && styles.chipTextActive}>
              {o.name}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

function makeStyles(colors: Palette) {
  return StyleSheet.create({
    row: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
    chip: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.accent,
    },
    chipActive: { backgroundColor: colors.accent },
    chipTextActive: { color: colors.onAccent },
  });
}
