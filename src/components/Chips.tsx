import { Pressable, StyleSheet, Text, View } from "react-native";

import type { SelectOption } from "./Select";

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
            <Text style={active && styles.chipTextActive}>{o.name}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
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
});
