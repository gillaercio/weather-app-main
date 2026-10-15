import { appState, setLanguage, getTranslation } from "./state.js";
import { fetchCitySuggestions, fetchCityByName, fetchWeather } from "./api.js";
import {
  renderAllUI,
  renderSuggestions,
  clearDropdown,
  setUIState,
  syncUnitControls,
  renderDailyForecast
} from "./renders.js";

function syncUnitToggleText() {
  const unitsToggle = document.querySelector(".units__toggle");

  if (!unitsToggle) return;

  appState.isImperial =
    appState.currentUnits.temperature === "fahrenheit" ||
    appState.currentUnits.wind === "mph" ||
    appState.currentUnits.precipitation === "in";

  unitsToggle.textContent = appState.isImperial ? "Switch to Metric" : "Switch to Imperial";
}

export function bindEvents() {
  const form = document.querySelector(".form");
  const inputForm = document.querySelector("#city");
  const cityDropdown = document.querySelector("#city-dropdown");
  const unitsButton = document.querySelector(".units__button");
  const unitsMenu = document.querySelector(".units__menu");
  const languageButton = document.querySelector(".language__button");
  const languageMenu = document.querySelector(".language__menu");
  const retryButton = document.querySelector("#retry-button");
  const unitsToggle = document.querySelector(".units__toggle");
  const temperatures = document.querySelectorAll('input[name="temperature"]');
  const winds = document.querySelectorAll('input[name="wind"]');
  const precipitations = document.querySelectorAll('input[name="precipitation"]');
  const hourlyForecastBtn = document.querySelector(".hourly-forecast__button");
  const hourlyDayMenu = document.querySelector("#hourly-day-menu");

  if (!form || !inputForm) {
    return;
  }

  syncUnitControls();
  syncUnitToggleText();

  const currentLanguageLabel = document.querySelector(".language__button");
  if (currentLanguageLabel) {
    currentLanguageLabel.textContent = appState.language.toUpperCase();
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const city = inputForm.value.trim();

    if (!city) {
      setUIState("empty", "Please, type the name of city before searching.");
      return;
    }

    try {
      setUIState("loading");

      const data = await fetchCityByName(city);

      if (!data.results || data.results.length === 0) {
        setUIState("no-results");
        return;
      }

      const { name, country, latitude, longitude } = data.results[0];
      const cityName = `${name}, ${country}`;

      appState.lastSearchedCity = cityName;
      document.querySelector(".current-location__description").textContent = cityName;

      const weatherData = await fetchWeather(latitude, longitude);
      appState.currentWeatherData = weatherData;
      appState.currentActiveDayIndex = 0;

      renderDailyForecast(weatherData);
      renderAllUI(weatherData);
      setUIState("success");
    } catch (error) {
      console.error("Error searching city:", error);
      setUIState("api-error");
    }
  });

  inputForm.addEventListener("input", (event) => {
    const query = event.target.value.trim();
    clearTimeout(appState.debounceTimer);

    if (query.length < 3) {
      clearDropdown();
      return;
    }

    appState.debounceTimer = setTimeout(async () => {
      try {
        const data = await fetchCitySuggestions(query);

        if (data.results && data.results.length > 0) {
          renderSuggestions(data.results);
        } else {
          clearDropdown();
        }
      } catch (error) {
        console.error("Error fetching city suggestions:", error);
        clearDropdown();
      }
    }, 350);
  });

  document.addEventListener("city-selected", async (event) => {
    const city = event.detail;

    if (!city) return;

    try {
      setUIState("loading");

      const weatherData = await fetchWeather(city.latitude, city.longitude);
      appState.currentWeatherData = weatherData;
      appState.currentActiveDayIndex = 0;

      const selectedCity = `${city.name}, ${city.country || ""}`.trim();
      appState.lastSearchedCity = selectedCity;

      const currentLocation = document.querySelector(".current-location__description");
      if (currentLocation) currentLocation.textContent = selectedCity;

      renderDailyForecast(weatherData);
      renderAllUI(weatherData);
      setUIState("success");
    } catch (error) {
      console.error("Error selecting city:", error);
      setUIState("api-error");
    }
  });

  if (unitsButton && unitsMenu) {
    unitsButton.addEventListener("click", (event) => {
      event.stopPropagation();

      const isHidden = unitsMenu.hasAttribute("hidden");

      if (isHidden) {
        unitsMenu.removeAttribute("hidden");
        unitsButton.setAttribute("aria-expanded", "true");
      } else {
        unitsMenu.setAttribute("hidden", "");
        unitsButton.setAttribute("aria-expanded", "false");
      }
    });
  }

  if (languageButton && languageMenu) {
    languageButton.addEventListener("click", (event) => {
      event.stopPropagation();

      const isHidden = languageMenu.hasAttribute("hidden");

      if (isHidden) {
        languageMenu.removeAttribute("hidden");
        languageButton.setAttribute("aria-expanded", "true");
      } else {
        languageMenu.setAttribute("hidden", "");
        languageButton.setAttribute("aria-expanded", "false");
      }
    });
  }

  temperatures.forEach((radio) => {
    radio.addEventListener("change", (event) => {
      appState.currentUnits.temperature = event.target.value;
      syncUnitToggleText();

      if (appState.currentWeatherData) {
        renderAllUI(appState.currentWeatherData);
      }

      syncUnitControls();
    });
  });

  winds.forEach((radio) => {
    radio.addEventListener("change", (event) => {
      appState.currentUnits.wind = event.target.value;
      syncUnitToggleText();

      if (appState.currentWeatherData) {
        renderAllUI(appState.currentWeatherData);
      }

      syncUnitControls();
    });
  });

  precipitations.forEach((radio) => {
    radio.addEventListener("change", (event) => {
      appState.currentUnits.precipitation = event.target.value;
      syncUnitToggleText();

      if (appState.currentWeatherData) {
        renderAllUI(appState.currentWeatherData);
      }

      syncUnitControls();
    });
  });

  const languageOptions = document.querySelectorAll('input[name="language"]');

  languageOptions.forEach((radio) => {
    radio.addEventListener("change", (event) => {
      const selectedLanguage = event.target.value;

      setLanguage(selectedLanguage);

      if (appState.currentWeatherData) {
        renderAllUI(appState.currentWeatherData);
      }

      if (languageMenu) {
        languageMenu.setAttribute("hidden", "");
        languageButton?.setAttribute("aria-expanded", "false");
      }
    });
  });

  if (unitsToggle) {
    unitsToggle.addEventListener("click", () => {
      appState.isImperial = !appState.isImperial;

      appState.currentUnits.temperature = appState.isImperial ? "fahrenheit" : "celsius";
      appState.currentUnits.wind = appState.isImperial ? "mph" : "km/h";
      appState.currentUnits.precipitation = appState.isImperial ? "in" : "mm";

      syncUnitToggleText();
      syncUnitControls();

      if (appState.currentWeatherData) {
        renderAllUI(appState.currentWeatherData);
      }
    });
  }

  if (hourlyForecastBtn && hourlyDayMenu) {
    hourlyForecastBtn.addEventListener("click", (event) => {
      event.stopPropagation();

      if (hourlyDayMenu.children.length === 0) return;

      const isHidden = hourlyDayMenu.hasAttribute("hidden");

      if (isHidden) {
        hourlyDayMenu.removeAttribute("hidden");
        hourlyForecastBtn.setAttribute("aria-expanded", "true");
      } else {
        hourlyDayMenu.setAttribute("hidden", "");
        hourlyForecastBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  document.addEventListener("click", (event) => {
    const target = event.target;

    if (unitsButton && unitsMenu && !unitsButton.contains(target) && !unitsMenu.contains(target)) {
      unitsMenu.setAttribute("hidden", "");
      unitsButton.setAttribute("aria-expanded", "false");
    }

    if (
      hourlyForecastBtn &&
      hourlyDayMenu &&
      !hourlyForecastBtn.contains(target) &&
      !hourlyDayMenu.contains(target)
    ) {
      hourlyDayMenu.setAttribute("hidden", "");
      hourlyForecastBtn.setAttribute("aria-expanded", "false");
    }

    if (cityDropdown && form && !form.contains(target)) {
      clearDropdown();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (unitsButton && unitsMenu && !unitsMenu.hasAttribute("hidden")) {
        unitsMenu.setAttribute("hidden", "");
        unitsButton.setAttribute("aria-expanded", "false");
      }

      if (hourlyForecastBtn && hourlyDayMenu && !hourlyDayMenu.hasAttribute("hidden")) {
        hourlyDayMenu.setAttribute("hidden", "");
        hourlyForecastBtn.setAttribute("aria-expanded", "false");
      }

      clearDropdown();
    }
  });

  if (retryButton) {
    retryButton.addEventListener("click", () => {
      if (appState.lastSearchedCity) {
        inputForm.value = appState.lastSearchedCity;
        form.requestSubmit();
      } else {
        setUIState("success");
      }
    });
  }
}