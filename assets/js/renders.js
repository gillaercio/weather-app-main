import { config } from "./config.js";
import { appState, getTranslation } from "./state.js";
import {
  formatTemp,
  formatWind,
  formatPrecipitation,
  getWeatherIcon
} from "./formatters.js";

export function syncUnitControls() {
  document.querySelectorAll('input[name="temperature"]').forEach((radio) => {
    radio.checked = radio.value === appState.currentUnits.temperature;
  });

  document.querySelectorAll('input[name="wind"]').forEach((radio) => {
    radio.checked = radio.value === appState.currentUnits.wind;
  });

  document.querySelectorAll('input[name="precipitation"]').forEach((radio) => {
    radio.checked = radio.value === appState.currentUnits.precipitation;
  });
}

export function clearDropdown() {
  const cityDropdown = document.querySelector("#city-dropdown");
  const inputForm = document.querySelector("#city");

  if (cityDropdown) {
    cityDropdown.innerHTML = "";
    cityDropdown.classList.add("hidden");
  }

  if (inputForm) {
    inputForm.setAttribute("aria-expanded", "false");
  }
}

export function clearUIForLoading() {
  const weatherAppMain = document.querySelector(".weather-app-main");
  const currentLocation = document.querySelector(".current-location__description");
  const currentTemperature = document.querySelector(".current-temperature__value");
  const currentDate = document.querySelector(".current-date");
  const currentIcon = document.querySelector(".current-temperature__icon");
  const currentResultValues = document.querySelectorAll(".current-result__value");
  const dailyForecastItems = document.querySelectorAll(".daily-forecast__item");
  const hourlyForecastItems = document.querySelectorAll(".hourly-forecast__item");
  const hourlyForecastDayText = document.querySelector(".hourly-forecast__day");
  const hourlyList = document.querySelector(".hourly-forecast__list");

  if (weatherAppMain) {
    weatherAppMain.classList.add("is-loading");
  }

  if (currentLocation) currentLocation.textContent = "";
  if (currentTemperature) currentTemperature.textContent = "";
  if (currentDate) currentDate.textContent = "";

  currentResultValues.forEach((item) => {
    item.textContent = "-";
  });

  if (currentIcon) {
    currentIcon.src = "assets/images/icon-loading.svg";
    currentIcon.alt = getTranslation("loading");
  }

  dailyForecastItems.forEach((item) => {
    const dayName = item.querySelector(".daily-forecast__day");
    const tempMax = item.querySelector(".daily-forecast__temperature-max");
    const tempMin = item.querySelector(".daily-forecast__temperature-min");
    const icon = item.querySelector(".daily-forecast__icon");

    if (dayName) dayName.textContent = "";
    if (tempMax) tempMax.textContent = "";
    if (tempMin) tempMin.textContent = "";
    if (icon) {
      icon.src = "";
      icon.alt = "";
    }
  });

  if (hourlyForecastDayText) {
    hourlyForecastDayText.textContent = "-";
  }

  hourlyForecastItems.forEach((item) => {
    const time = item.querySelector(".hourly-forecast__time");
    const temp = item.querySelector(".hourly-forecast__temperature");
    const icon = item.querySelector(".hourly-forecast__icon");

    if (time) time.textContent = "";
    if (temp) temp.textContent = "";
    if (icon) {
      icon.src = "";
      icon.alt = "";
    }
  });

  if (hourlyList) {
    hourlyList.innerHTML = "";
    for (let i = 0; i < 8; i++) {
      const li = document.createElement("li");
      li.classList.add("hourly-forecast__item");
      hourlyList.appendChild(li);
    }
  }
}

export function setUIState(state, message = "") {
  const form = document.querySelector(".form");
  const inputForm = document.querySelector("#city");
  const errorMessage = document.querySelector(".error-message");
  const weatherAppMain = document.querySelector(".weather-app-main");
  const apiErrorSection = document.querySelector("#api-error-state");
  const headerTitle = document.querySelector(".header__title");
  const searchProgress = document.querySelector("#search-progress");
  const submitButton = form ? form.querySelector('button[type="submit"]') : null;
  const retryButton = document.querySelector("#retry-button");

  const updateRetryButton = (isVisible) => {
    if (!retryButton) return;

    retryButton.hidden = !isVisible;
    retryButton.style.display = isVisible ? "flex" : "none";
  };

  if (weatherAppMain) {
    weatherAppMain.classList.remove("is-loading");
  }

  if (errorMessage) errorMessage.textContent = "";
  if (inputForm) inputForm.disabled = false;
  if (submitButton) submitButton.disabled = false;
  if (searchProgress) searchProgress.classList.add("hidden");

  if (state === "loading") {
    if (form) form.setAttribute("aria-busy", "true");
    if (inputForm) inputForm.disabled = true;
    if (submitButton) submitButton.disabled = true;
    if (headerTitle) headerTitle.classList.remove("hidden");
    if (form) form.classList.remove("hidden");
    if (weatherAppMain) weatherAppMain.classList.remove("hidden");
    if (apiErrorSection) apiErrorSection.classList.add("hidden");
    if (searchProgress) searchProgress.classList.remove("hidden");

    clearUIForLoading();
    return;
  }

  if (state === "success") {
    if (weatherAppMain) weatherAppMain.classList.remove("is-loading");
    if (headerTitle) headerTitle.classList.remove("hidden");
    if (form) form.classList.remove("hidden");
    if (weatherAppMain) weatherAppMain.classList.remove("hidden");
    if (apiErrorSection) apiErrorSection.classList.add("hidden");
    return;
  }

  if (state === "api-error") {
    if (weatherAppMain) weatherAppMain.classList.remove("is-loading");
    updateRetryButton(true);

    if (headerTitle) headerTitle.classList.add("hidden");
    if (form) form.classList.add("hidden");
    if (weatherAppMain) weatherAppMain.classList.add("hidden");

    if (apiErrorSection) {
      apiErrorSection.classList.remove("error-state--no-results");
      apiErrorSection.classList.remove("hidden");

      const title = apiErrorSection.querySelector(".error-state__title");
      const description = apiErrorSection.querySelector(".error-state__description");
      const retryButton = apiErrorSection.querySelector("#retry-button");

      if (title) title.textContent = getTranslation("apiErrorTitle");
      if (description) description.textContent = getTranslation("apiErrorDescription");
      if (retryButton) {
        let icon = retryButton.querySelector(".button__icon");
        if (!icon) {
          icon = document.createElement("img");
          icon.src = "assets/images/icon-retry.svg";
          icon.alt = "";
          icon.className = "button__icon";
          retryButton.prepend(icon);
        }

        let label = retryButton.querySelector(".retry-label");
        if (!label) {
          label = document.createElement("span");
          label.className = "retry-label";
          retryButton.appendChild(label);
        }

        label.textContent = getTranslation("retryButton");
      }
    }
    return;
  }

  if (state === "no-results") {
    if (weatherAppMain) weatherAppMain.classList.remove("is-loading");
    updateRetryButton(false);

    if (headerTitle) headerTitle.classList.remove("hidden");
    if (form) form.classList.remove("hidden");
    if (weatherAppMain) weatherAppMain.classList.add("hidden");

    if (apiErrorSection) {
      apiErrorSection.classList.add("error-state--no-results");

      const title = apiErrorSection.querySelector(".error-state__title");
      const description = apiErrorSection.querySelector(".error-state__description");

      if (title) title.textContent = getTranslation("noResultsTitle");
      if (description) description.textContent = getTranslation("noResultsDescription");

      apiErrorSection.classList.remove("hidden");
    }
    return;
  }

  if (state === "empty") {
    if (errorMessage) errorMessage.textContent = message;
    if (headerTitle) headerTitle.classList.remove("hidden");
    if (form) form.classList.remove("hidden");
  }
}

export function renderDailyForecast(data) {
  const dailyForecastItems = document.querySelectorAll(".daily-forecast__item");
  const hourlyForecastDayText = document.querySelector(".hourly-forecast__day");
  const hourlyDayMenu = document.querySelector("#hourly-day-menu");

  if (!data) return;

  hourlyDayMenu.innerHTML = "";
  hourlyDayMenu.setAttribute("hidden", "");
  document.querySelector(".hourly-forecast__button").setAttribute("aria-expanded", "false");

  for (let i = 0; i < dailyForecastItems.length; i++) {
    const item = dailyForecastItems[i];
    const [year, month, day] = data.daily.time[i].split("-");
    const date = new Date(year, month - 1, day);

    const locale = config.localeMap[appState.language] || "en-US";
    const formattedDayShort = date.toLocaleDateString(locale, { weekday: "short" });
    const formattedDayLong = date.toLocaleDateString(locale, { weekday: "long" });

    const dayName = item.querySelector(".daily-forecast__day");
    const icon = item.querySelector(".daily-forecast__icon");
    const dayTempMax = item.querySelector(".daily-forecast__temperature-max");
    const dayTempMin = item.querySelector(".daily-forecast__temperature-min");

    if (dayName) dayName.textContent = formattedDayShort;
    if (icon) icon.src = getWeatherIcon(data.daily.weather_code[i]);

    if (dayTempMax) {
      dayTempMax.textContent = formatTemp(
        data.daily.temperature_2m_max[i],
        appState.currentUnits.temperature
      );
    }

    if (dayTempMin) {
      dayTempMin.textContent = formatTemp(
        data.daily.temperature_2m_min[i],
        appState.currentUnits.temperature
      );
    }

    if (i === 0 && hourlyForecastDayText) {
      hourlyForecastDayText.textContent = formattedDayLong;
    }

    const optionBtn = document.createElement("button");
    optionBtn.type = "button";
    optionBtn.classList.add("hourly-forecast__option");
    optionBtn.textContent = formattedDayLong;

    optionBtn.addEventListener("click", (event) => {
      event.stopPropagation();

      appState.currentActiveDayIndex = i;
      hourlyForecastDayText.textContent = formattedDayLong;
      renderHourlyForecast(i, data);

      hourlyDayMenu.setAttribute("hidden", "");
      document.querySelector(".hourly-forecast__button").setAttribute("aria-expanded", "false");
    });

    hourlyDayMenu.appendChild(optionBtn);
  }
}

export function renderHourlyForecast(dayIndex, data) {
  const hourlyList = document.querySelector(".hourly-forecast__list");
  if (!hourlyList) return;

  hourlyList.innerHTML = "";

  const hourlyTimes = data.hourly.time;
  const hourlyTemperatures = data.hourly.temperature_2m;
  const hourlyWeatherCodes = data.hourly.weather_code;

  let startHourIndex = dayIndex * 24;
  let endHourIndex = startHourIndex + 24;

  if (dayIndex === 0) {
    const currentHour = new Date().getHours();
    const foundIndex = hourlyTimes.findIndex(
      (time) => new Date(time).getHours() === currentHour
    );

    if (foundIndex !== -1) {
      startHourIndex = foundIndex;
    }
  }

  const fragment = document.createDocumentFragment();

  for (let i = startHourIndex; i < endHourIndex; i++) {
    const timeString = hourlyTimes[i];
    const tempFormatted = formatTemp(
      hourlyTemperatures[i],
      appState.currentUnits.temperature
    );
    const code = hourlyWeatherCodes[i];

    const dateObj = new Date(timeString);
    const locale = config.localeMap[appState.language] || "en-US";
    const formattedHour = dateObj.toLocaleTimeString(locale, {
      hour: "numeric",
      hour12: true
    });

    const li = document.createElement("li");
    li.classList.add("hourly-forecast__item");

    li.innerHTML = `
      <div class="hourly-forecast__sub-item">
        <img src="${getWeatherIcon(code)}" alt="" class="hourly-forecast__icon">
        <span class="hourly-forecast__time">${formattedHour}</span>
      </div>
      <span class="hourly-forecast__temperature">${tempFormatted}</span>
    `;

    fragment.appendChild(li);
  }

  hourlyList.appendChild(fragment);
}

export function renderAllUI(data) {
  if (!data) return;

  const currentTemperature = document.querySelector(".current-temperature__value");
  const currentResultValues = document.querySelectorAll(".current-result__value");
  const currentIcon = document.querySelector(".current-temperature__icon");
  const currentDate = document.querySelector(".current-date");
  const resultLabels = document.querySelectorAll(".current-result__label");

  if (resultLabels[0]) resultLabels[0].textContent = getTranslation("feelslike");
  if (resultLabels[1]) resultLabels[1].textContent = getTranslation("humidity");
  if (resultLabels[2]) resultLabels[2].textContent = getTranslation("wind");
  if (resultLabels[3]) resultLabels[3].textContent = getTranslation("precipitation");

  if (currentTemperature) {
    currentTemperature.textContent = formatTemp(
      data.current.temperature_2m,
      appState.currentUnits.temperature
    );
  }

  if (currentResultValues[0]) {
    currentResultValues[0].textContent = formatTemp(
      data.current.temperature_2m,
      appState.currentUnits.temperature
    );
  }

  if (currentResultValues[1]) {
    currentResultValues[1].textContent = `${data.current.relative_humidity_2m}%`;
  }

  if (currentResultValues[2]) {
    currentResultValues[2].textContent = formatWind(
      data.current.wind_speed_10m,
      appState.currentUnits.wind
    );
  }

  if (currentResultValues[3]) {
    currentResultValues[3].textContent = formatPrecipitation(
      data.current.precipitation,
      appState.currentUnits.precipitation
    );
  }

  if (currentIcon) {
    currentIcon.src = getWeatherIcon(data.current.weather_code);
  }

  if (currentDate) {
    const locale = config.localeMap[appState.language] || "en-US";
    currentDate.textContent = new Date().toLocaleDateString(locale, {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  renderDailyForecast(data);
  renderHourlyForecast(appState.currentActiveDayIndex, data);
}

export function renderDropdownSuggestions(cities) {
  const cityDropdown = document.querySelector("#city-dropdown");
  const inputForm = document.querySelector("#city");

  if (!cityDropdown) return;

  cityDropdown.innerHTML = "";

  cities.forEach((city) => {
    const li = document.createElement("li");
    li.classList.add("city-dropdown__item");
    li.setAttribute("role", "option");

    const button = document.createElement("button");
    button.type = "button";
    button.classList.add("city-dropdown__button");

    const cityName = city.name;
    const countryName = city.country ? `, ${city.country}` : "";
    const fullLocation = `${cityName}${countryName}`;

    button.textContent = fullLocation;

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (inputForm) {
        inputForm.value = fullLocation;
      }

      clearDropdown();

      document.dispatchEvent(
        new CustomEvent("city-selected", {
          detail: {
            ...city,
            fullLocation
          }
        })
      );
    });

    li.appendChild(button);
    cityDropdown.appendChild(li);
  });

  cityDropdown.classList.remove("hidden");

  if (inputForm) {
    inputForm.setAttribute("aria-expanded", "true");
  }
}

export function renderSuggestions(cities) {
  renderDropdownSuggestions(cities);
}