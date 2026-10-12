import { Stack } from 'expo-router';

// Layout radice: per ora una sola schermata dentro uno Stack
export default function RootLayout() {
  return <Stack screenOptions={{ title: 'Planer' }} />;
}
