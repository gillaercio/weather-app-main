export const appState = {
  currentWeatherData: null,
  currentActiveDayIndex: 0,
  isImperial: false,
  lastSearchedCity: "",
  debounceTimer: null,
  currentUnits: {
    temperature: "fahrenheit",
    wind: "mph",
    precipitation: "in"
  }
};

export function initAppState(defaultUnits) {
  appState.currentUnits = { ...defaultUnits };
  appState.isImperial =
    appState.currentUnits.temperature === "fahrenheit" ||
    appState.currentUnits.wind === "mph" ||
    appState.currentUnits.precipitation === "in";
}