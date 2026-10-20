import { useColorScheme } from "react-native";

import { COLORS, type Palette } from "@/constants/theme";

// Colori del tema attivo: si aggiorna da solo quando cambia il tema del telefono
export function useTheme(): Palette {
  const scheme = useColorScheme();
  return COLORS[scheme === "dark" ? "dark" : "light"];
}