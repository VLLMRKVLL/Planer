import { Stack } from "expo-router";

// Stack del tab dei voli: dà l'intestazione e in futuro ospiterà
// il dettaglio di un volo (flights/[id]), aperto dentro il tab.
export default function FlightsLayout() {
  return <Stack screenOptions={{ title: "Flights" }} />;
}
