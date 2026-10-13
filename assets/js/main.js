import { config } from "./config.js";
// import { appState, initAppState } from "./state.js";
// import { fetchCityByName, fetchWeather, fetchCitySuggestions } from "./api.js";
// import { formatTemp, formatWind, formatPrecipitation, getWeatherIcon } from "./formatters.js";
// import { renderWeather, clearDropdown, clearUIForLoading, renderHourlyForecast, renderSuggestions, setUIState, renderAllUI } from "./renders.js";
import { initAppState } from "./state.js";
import { bindEvents } from "./events.js";

initAppState(config.defaultUnits);
bindEvents();