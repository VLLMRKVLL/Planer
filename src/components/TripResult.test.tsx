import { render, screen } from "@testing-library/react-native";

import { TripResult } from "./TripResult";

import { calculateTrip } from "@/core";

const at = (hours: number, minutes = 0) => new Date(2026, 5, 1, hours, minutes);

// Stesso volo del primo test di calculateTrip: MXP alle 10:00, bagaglio, vince il gate
const plan = calculateTrip({
  airport: "MXP",
  departureTime: at(10),
  destinationCountry: "FR",
  hasCheckedBag: true,
  onlineCheckInDone: true,
  travelTimeMinutes: 60,
});

describe("TripResult", () => {
  it("shows when to leave home and when to arrive at the airport", async () => {
    await render(<TripResult plan={plan} />);
    expect(screen.getByText("Parti da casa alle 07:10")).toBeOnTheScreen();
    expect(
      screen.getByText("Arriva in aeroporto alle 08:10"),
    ).toBeOnTheScreen();
  });

  it("lists every step of the timeline with its times and minutes", async () => {
    await render(<TripResult plan={plan} />);
    expect(screen.getByText("Viaggio da casa")).toBeOnTheScreen();
    expect(screen.getByText("07:10–08:10")).toBeOnTheScreen();
    expect(screen.getByText("Banco / drop bagagli")).toBeOnTheScreen();
    expect(screen.getByText("Controlli di sicurezza")).toBeOnTheScreen();
    expect(screen.getByText("Cammino al gate")).toBeOnTheScreen();
    expect(screen.getByText("Tempo libero al gate")).toBeOnTheScreen();
    // Volo Schengen: niente controllo passaporti
    expect(screen.queryByText("Controllo passaporti")).not.toBeOnTheScreen();
  });

  it("shows the deadlines and the binding constraint", async () => {
    await render(<TripResult plan={plan} />);
    expect(screen.getByText("Chiusura banco")).toBeOnTheScreen();
    expect(screen.getByText("Chiusura gate")).toBeOnTheScreen();
    expect(screen.getByText("09:30")).toBeOnTheScreen();
    expect(
      screen.getByText("Vincolo decisivo: chiusura gate"),
    ).toBeOnTheScreen();
  });
});
