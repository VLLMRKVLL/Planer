import { View } from "react-native";
import { Host, Picker } from "@expo/ui";

import {
  HOURS_LIST,
  MINUTES_LIST,
  type TimeWheelProps,
} from "./TimeWheel.types";

export function TimeWheel({ valueMinutes, onChange }: TimeWheelProps) {
  const hours = Math.floor(valueMinutes / 60);
  const minutes = valueMinutes % 60;
  return (
    <View style={{ flexDirection: "row", gap: 8}}>
      <Host matchContents>
        <Picker
          selectedValue={hours}
          onValueChange={(h) => onChange(h * 60 + minutes)}
        >
          {HOURS_LIST.map((h) => (
            <Picker.Item key={h} label={`${h} ore`} value={h} />
          ))}
        </Picker>
      </Host>
      <Host matchContents>
        <Picker
          selectedValue={minutes}
          onValueChange={(m) => onChange(hours * 60 + m)}
        >
          {MINUTES_LIST.map((m) => (
            <Picker.Item key={m} label={`${m} min`} value={m} />
          ))}
        </Picker>
      </Host>
    </View>
  );
}
