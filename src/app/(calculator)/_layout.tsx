import { Stack } from "expo-router";

// Stack del tab del calcolatore: dà l'intestazione con il titolo.
// Il tema arriva già dal ThemeProvider del layout radice.
export default function CalculatorLayout() {
  return <Stack screenOptions={{ title: "Calculator" }} />;
}
