import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { useColorScheme } from "react-native";

// Layout radice: per ora una sola schermata dentro uno Stack
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = (colorScheme !== "dark") ? DefaultTheme : DarkTheme;

  return (
    <ThemeProvider value={theme}>
      <Stack screenOptions={{ title: "Planer" }} />
    </ThemeProvider>
  );
}
