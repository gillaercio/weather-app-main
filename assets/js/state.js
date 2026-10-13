export const appState = {
  currentWeatherData: null,
  currentActiveDayIndex: 0,
  isImperial: false,
  lastSearchedCity: "",
  debounceTimer: null,
  currentUnits: {
    temperature: "celsius",
    wind: "km/h",
    precipitation: "mm"
  }
};

export function initAppState(defaultUnits) {
  appState.currentUnits = { ...defaultUnits };
}