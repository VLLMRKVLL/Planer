import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useColorScheme } from "react-native";

// Layout radice: per ora una sola schermata dentro uno Stack
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme !== "dark" ? DefaultTheme : DarkTheme;

  return (
    <ThemeProvider value={theme}>
      <NativeTabs>
        <NativeTabs.Trigger name="flights">
          <NativeTabs.Trigger.Icon sf="airplane" />
          <NativeTabs.Trigger.Label>I miei voli</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="(calculator)">
          <NativeTabs.Trigger.Icon sf="clock" />
          <NativeTabs.Trigger.Label>Calcolatore</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </ThemeProvider>
  );
}
