// Ruoli dei colori: i componenti usano questi nomi, la palette decide il valore
export type Palette = {
  background: string; // sfondo della schermata
  text: string; // testo principale
  textMuted: string; // note, minuti delle tappe
  border: string; // bordo degli input
  card: string; // box del risultato
  accent: string; // chip, elementi attivi
  onAccent: string; // testo sopra l'accento
};

export type ColorSchemeName = "light" | "dark";

export const COLORS: Record<ColorSchemeName, Palette> = {
  light: {
    background: "#FFFFFF",
    text: "#000000",
    textMuted: "#666666",
    border: "#CCCCCC",
    card: "#EEF6FF",
    accent: "#208AEF",
    onAccent: "#FFFFFF",
  },
  dark: {
    background: "#000000",
    text: "#FFFFFF",
    textMuted: "#9A9A9F",
    border: "#3A3A3C",
    card: "#13233A",
    accent: "#208AEF",
    onAccent: "#FFFFFF",
  },
};