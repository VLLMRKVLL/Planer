import { Host, HStack, Picker, Text } from "@expo/ui/swift-ui";
import {
    background,
    clipped,
    font,
    foregroundStyle,
    frame,
    pickerStyle,
    tag,
} from "@expo/ui/swift-ui/modifiers";

import {
    HOURS_LIST,
    MINUTES_LIST,
    type TimeWheelProps,
} from "./TimeWheel.types";

const ACCENT = "#208AEF";
const CARD_BG = "#EEF6FF";

// Rotelle in stile app Orologio: colonne attaccate, etichette fisse accanto al numero
export function TimeWheel({ valueMinutes, onChange }: TimeWheelProps) {
  const hours = Math.floor(valueMinutes / 60);
  const minutes = valueMinutes % 60;

  const wheel = [pickerStyle("wheel"), frame({ width: 70 }), clipped()];
  const number = [font({ size: 22 })];
  const unit = [
    font({ size: 17, weight: "semibold" }),
    foregroundStyle(ACCENT),
    frame({ width: 40, alignment: "leading" }),
  ];
  const card = [background(CARD_BG)];

  return (
    <Host matchContents>
      <HStack spacing={0} modifiers={card}>
        <Picker
          selection={hours}
          onSelectionChange={(h: number) => onChange(h * 60 + minutes)}
          modifiers={wheel}
        >
          {HOURS_LIST.map((h) => (
            <Text key={h} modifiers={[tag(h), ...number]}>
              {String(h)}
            </Text>
          ))}
        </Picker>
        <Text modifiers={unit}>ore</Text>

        <Picker
          selection={minutes}
          onSelectionChange={(m: number) => onChange(hours * 60 + m)}
          modifiers={wheel}
        >
          {MINUTES_LIST.map((m) => (
            <Text key={m} modifiers={[tag(m), ...number]}>
              {String(m).padStart(2, "0")}
            </Text>
          ))}
        </Picker>
        <Text modifiers={unit}>min</Text>
      </HStack>
    </Host>
  );
}
