import { config } from "./config.js";

export const appState = {
  currentWeatherData: null,
  currentActiveDayIndex: 0,
  isImperial: false,
  lastSearchedCity: "",
  language: config.defaultLanguage,
  availableLanguages: config.supportedLanguages,
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

export function setLanguage(language) {
  if (!config.supportedLanguages.includes(language)) {
    return appState.language;
  }

  appState.language = language;
  return appState.language;
}

export function getTranslation(key) {
  const activeLanguage = appState.language || config.defaultLanguage;
  const translations = config.translations[activeLanguage];
  const fallback = config.translations[config.defaultLanguage];

  if (!translations) {
    return fallback[key] ?? key;
  }

  return translations[key] ?? fallback[key] ?? key;
}