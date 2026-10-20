import { Text, type TextProps } from "react-native";

import { useTheme } from "@/hooks/useTheme";

// Text con il colore del tema come default, come una regola CSS generale:
// lo stile passato da fuori viene dopo, quindi un suo `color` vince sempre
export function ThemedText({ style, ...rest }: TextProps) {
  const colors = useTheme();
  return <Text style={[{ color: colors.text }, style]} {...rest} />;
}
