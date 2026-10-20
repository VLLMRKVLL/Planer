// Test del form. Sta fuori da src/app perché Expo Router tratta ogni file di
// quella cartella come una pagina dell'app.
import { fireEvent, render, screen } from "@testing-library/react-native";

import HomeScreen from "@/app/index";

describe("HomeScreen", () => {
  it("shows the form and a result with the default values", async () => {
    await render(<HomeScreen />);
    expect(screen.getByText("Paese di partenza")).toBeOnTheScreen();
    expect(screen.getByText("Aeroporto")).toBeOnTheScreen();
    expect(screen.getByText("Compagnia")).toBeOnTheScreen();
    // Il calcolo parte subito, senza bottoni
    expect(screen.getByText(/^Parti da casa alle/)).toBeOnTheScreen();
    expect(screen.getByText(/^Arriva in aeroporto alle/)).toBeOnTheScreen();
  });

  it("shows the terminal chips for an airport with more terminals", async () => {
    // L'aeroporto iniziale è MXP, che ha T1 e T2
    await render(<HomeScreen />);
    expect(screen.getByText("Terminal 1")).toBeOnTheScreen();
    expect(screen.getByText("Terminal 2")).toBeOnTheScreen();
  });

  it("adds the bag drop when there is a checked bag", async () => {
    await render(<HomeScreen />);
    // Di default: niente bagaglio e check-in online fatto → niente banco
    expect(screen.queryByText("Banco / drop bagagli")).not.toBeOnTheScreen();
    expect(screen.queryByText("Chiusura banco")).not.toBeOnTheScreen();

    const [checkedBag] = screen.getAllByRole("switch");
    await fireEvent(checkedBag, "valueChange", true);

    expect(screen.getByText("Banco / drop bagagli")).toBeOnTheScreen();
    expect(screen.getByText("Chiusura banco")).toBeOnTheScreen();
  });

  it("adds the bag drop when online check-in is not done", async () => {
    await render(<HomeScreen />);
    const [, onlineCheckIn] = screen.getAllByRole("switch");
    await fireEvent(onlineCheckIn, "valueChange", false);
    expect(screen.getByText("Banco / drop bagagli")).toBeOnTheScreen();
  });

  it("hides the result when the travel minutes are not a number", async () => {
    await render(<HomeScreen />);
    await fireEvent.changeText(screen.getByDisplayValue("45"), "abc");
    expect(screen.queryByText(/^Parti da casa alle/)).not.toBeOnTheScreen();
    expect(
      screen.getByText("Compila i campi per vedere il risultato."),
    ).toBeOnTheScreen();
  });

  it("uses the new travel minutes in the timeline", async () => {
    await render(<HomeScreen />);
    await fireEvent.changeText(screen.getByDisplayValue("45"), "90");
    expect(screen.getByText("90 min")).toBeOnTheScreen();
  });
});
