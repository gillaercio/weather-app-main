// Etapa JS 1 — DOM
// - selecionar elementos -> testar console.log

// Etapa JS 2 — Menu de unidades
// - abrir
// - fechar
// - selecionar

// Etapa JS 3 — formulário
// - submit -> capturar cidade -> validar entrada

// Etapa JS 4 — API
// - fetch -> async/await -> response -> JSON

// Etapa JS 5 — clima atual
// - cidade
// - data
// - temperatura
// - ícone

// Etapa JS 6 — cards
// - current results -> daily forecast -> hourly forecast
const GEOCODING_BASE_URL = "https://geocoding-api.open-meteo.com/v1/search";
// const GEOCODING_BASE_URL = "https://geocoding-api.open-meteo.com/v1/search_INVALIDA";
const WEATHER_BASE_URL = "https://api.open-meteo.com/v1/forecast";
const ICONS_PATH = "assets/images/";

const headerTitle = document.querySelector(".header__title");
const unitsButton = document.querySelector(".units__button");
const unitsMenu = document.querySelector(".units__menu");
const temperatures = document.querySelectorAll('input[name="temperature"]');
const winds = document.querySelectorAll('input[name="wind"]');
const precipitations = document.querySelectorAll('input[name="precipitation"]');
const unitsToggle = document.querySelector(".units__toggle");

const form = document.querySelector(".form");
const inputForm = document.querySelector("#city");
const cityDropdown = document.querySelector("#city-dropdown");
const searchProgress = document.querySelector("#search-progress");
const errorMessage = document.querySelector(".error-message");
const weatherAppMain = document.querySelector(".weather-app-main");

const currentLocation = document.querySelector(".current-location__description");
const currentTemperature = document.querySelector(".current-temperature__value");
const currentDate = document.querySelector(".current-date");
const currentIcon = document.querySelector(".current-temperature__icon");
const currentResultValues = document.querySelectorAll(".current-result__value");

const dailyForecastItems = document.querySelectorAll(".daily-forecast__item");

const hourlyForecastBtn = document.querySelector(".hourly-forecast__button");
const hourlyForecastDayText = document.querySelector(".hourly-forecast__day");
const hourlyDayMenu = document.querySelector("#hourly-day-menu");
const hourlyList = document.querySelector(".hourly-forecast__list");

const apiErrorSection = document.querySelector("#api-error-state");
const retryButton = document.querySelector("#retry-button");

let debounceTimer = null;
let currentWeatherData = null;
let currentActiveDayIndex = 0;
let isImperial = false;
let lastSearchedCity = "";

let currentUnits = {
  temperature: 'celsius',
  wind: 'km/h',
  precipitation: 'mm'
};

const datetime = new Date();
const formattedDatetime = datetime.toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'short',
  day: 'numeric',
  year: 'numeric'
});

function setUIState(state, message = "") {
  clearDropdown();
  const dashboard = document.querySelector(".weather-dashboard") || document.body;

  form.removeAttribute("aria-busy");
  if (errorMessage) errorMessage.textContent = "";

  const submitButton = form.querySelector('button[type="submit"]');

  switch (state) {
    case "loading":
      form.setAttribute("aria-busy", "true");

      if (inputForm) inputForm.disabled = true;
      if (submitButton) submitButton.disabled = true;
      dashboard.classList.add("is-loading");

      if (searchProgress) searchProgress.classList.remove("hidden");

      if (headerTitle) headerTitle.classList.remove("hidden");
      if (form) form.classList.remove("hidden");

      currentResultValues.forEach(el => el.textContent = "-");

      if (apiErrorSection) apiErrorSection.classList.add("hidden");
      if (weatherAppMain) weatherAppMain.classList.remove("hidden");
      clearUIForLoading();
      break;
    case "success":
      if (inputForm) inputForm.disabled = false;
      if (submitButton) submitButton.disabled = false;
      dashboard.classList.remove("is-loading");

      if (searchProgress) searchProgress.classList.add("hidden");

      if (headerTitle) headerTitle.classList.remove("hidden");
      if (form) form.classList.remove("hidden");

      if (apiErrorSection) apiErrorSection.classList.add("hidden");
      if (weatherAppMain) weatherAppMain.classList.remove("hidden");
      break;
    case "api-error":
      if (inputForm) inputForm.disabled = false;
      if (submitButton) submitButton.disabled = false;
      dashboard.classList.remove("is-loading");

      if (searchProgress) searchProgress.classList.add("hidden");

      if (headerTitle) headerTitle.classList.add("hidden");
      if (form) form.classList.add("hidden");
      if (weatherAppMain) weatherAppMain.classList.add("hidden");

      if (apiErrorSection) {
        apiErrorSection.classList.remove("error-state--no-results");
        if (retryButton) retryButton.classList.remove("hidden");
        apiErrorSection.classList.remove("hidden");
      }
      break;
    case "no-results":
      if (inputForm) inputForm.disabled = false;
      if (submitButton) submitButton.disabled = false;
      dashboard.classList.remove("is-loading");

      if (searchProgress) searchProgress.classList.add("hidden");

      if (headerTitle) headerTitle.classList.remove("hidden");
      if (form) form.classList.remove("hidden");
      if (weatherAppMain) weatherAppMain.classList.add("hidden");

      if (apiErrorSection) {
        apiErrorSection.classList.add("error-state--no-results");
        apiErrorSection.querySelector(".error-state__title").textContent = "No search result found.";
        apiErrorSection.querySelector(".error-state__description").textContent = "";
        if (retryButton) retryButton.classList.add("hidden");
        apiErrorSection.classList.remove("hidden");
      }
      break;
    case "empty":
      if (inputForm) inputForm.disabled = false;
      if (submitButton) submitButton.disabled = false;
      dashboard.classList.remove("is-loading");

      if (searchProgress) searchProgress.classList.add("hidden");

      if (errorMessage) errorMessage.textContent = message;

      if (headerTitle) headerTitle.classList.remove("hidden");
      if (form) form.classList.remove("hidden");
      break;
  }
}

function showNoResultsError() {
  if (weatherAppMain) weatherAppMain.classList.add("hidden");

  if (errorMessage) {
    errorMessage.textContent = "No search result found!";
    errorMessage.removeAttribute("hidden");
  }
}

function clearErrorState() {
  if (errorMessage) {
    errorMessage.textContent = "";
    errorMessage.setAttribute("hidden", "true");
  }
  if (weatherAppMain) weatherAppMain.classList.remove("hidden");
}

function clearUIForLoading() {
  if (currentLocation) currentLocation.textContent = "";
  if (currentTemperature) currentTemperature.textContent = "";
  if (currentDate) currentDate.textContent = "";

  if (currentIcon) {
    currentIcon.src = `${ICONS_PATH}icon-loading.svg`;
    currentIcon.alt = "Loading...";
  }

  dailyForecastItems.forEach(item => {
    const dayName = item.querySelector(".daily-forecast__day");
    const tempMax = item.querySelector(".daily-forecast__temperature-max");
    const tempMin = item.querySelector(".daily-forecast__temperature-min");
    const icon = item.querySelector(".daily-forecast__icon");

    if (dayName) dayName.textContent = "";
    if (tempMax) tempMax.textContent = "";
    if (tempMin) tempMin.textContent = "";
    if (icon) {
      icon.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz4";
      icon.alt = "";
    }
  });

  if (hourlyForecastDayText) {
    hourlyForecastDayText.textContent = "-";
  }

  if (hourlyList) {
    hourlyList.innerHTML = "";
    for (let i = 0; i < 8; i++) {
      const li = document.createElement("li");
      li.classList.add("hourly-forecast__item");
      hourlyList.appendChild(li);
    }
  }
}

inputForm.addEventListener("input", (e) => {
  const query = e.target.value.trim();

  clearTimeout(debounceTimer);

  if (query.length < 3) {
    clearDropdown();
    return;
  }

  debounceTimer = setTimeout(() => {
    fetchCitySuggestions(query);
  }, 350);
});

unitsButton.addEventListener("click", (e) => {
  e.stopPropagation();
  const isHidden = unitsMenu.hasAttribute("hidden");

  if (isHidden) {
    unitsMenu.removeAttribute("hidden");
    unitsButton.setAttribute("aria-expanded", "true");
  } else {
    unitsMenu.setAttribute("hidden", "");
    unitsButton.setAttribute("aria-expanded", "false");
  }
});

temperatures.forEach(radio => {
  radio.addEventListener("change", (e) => {
    currentUnits.temperature = e.target.value;
    if (currentWeatherData) renderAllUI(currentWeatherData);
  });
});

winds.forEach(radio => {
  radio.addEventListener("change", (e) => {
    currentUnits.wind = e.target.value;
    if (currentWeatherData) renderAllUI(currentWeatherData);
  });
});

precipitations.forEach(radio => {
  radio.addEventListener("change", (e) => {
    currentUnits.precipitation = e.target.value;
    if (currentWeatherData) renderAllUI(currentWeatherData);
  });
});

unitsToggle.addEventListener("click", () => {
  isImperial = !isImperial;
  unitsToggle.textContent = isImperial ? 'Switch to Metric': 'Switch to Imperial';

  currentUnits.temperature = isImperial ? 'fahrenheit' : 'celsius';
  currentUnits.wind = isImperial ? 'mph' : 'km/h';
  currentUnits.precipitation = isImperial ? 'in' : 'mm';

  saveSelectedTemperature();
  saveSelectedWind();
  saveSelectedPrecipitation();

  if (currentWeatherData) {
    renderAllUI(currentWeatherData);
  }
});

hourlyForecastBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  const isHidden = hourlyDayMenu.hidden;

  if (hourlyDayMenu.children.length === 0) return;

  if (isHidden) {
    hourlyDayMenu.removeAttribute("hidden");
    hourlyForecastBtn.setAttribute("aria-expanded", "true");
  } else {
    hourlyDayMenu.setAttribute("hidden", "");
    hourlyForecastBtn.setAttribute("aria-expanded", "false");
  }
});

document.addEventListener("click", (e) => {
  if (!unitsButton.contains(e.target) && !unitsMenu.contains(e.target)) {
    unitsMenu.setAttribute("hidden", "");
    unitsButton.setAttribute("aria-expanded", "false");
  }

  if (!hourlyForecastBtn.contains(e.target) && !hourlyDayMenu.contains(e.target)) {
    hourlyDayMenu.setAttribute("hidden", "");
    hourlyForecastBtn.setAttribute("aria-expanded", "false");
  }

  if (cityDropdown && !form.contains(e.target)) {
    clearDropdown();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    unitsMenu.setAttribute("hidden", "");
    unitsButton.setAttribute("aria-expanded", "false");

    hourlyDayMenu.setAttribute("hidden", "");
    hourlyForecastBtn.setAttribute("aria-expanded", "false");

    clearDropdown();
  }
});

function saveSelectedTemperature() {
  temperatures.forEach(temperature => {
    temperature.checked = (temperature.value === currentUnits.temperature);
  });
}

function saveSelectedWind() {
  winds.forEach(wind => {
    wind.checked = (wind.value === currentUnits.wind);
  });
}

function saveSelectedPrecipitation() {
  precipitations.forEach(precipitation => {
    precipitation.checked = (precipitation.value === currentUnits.precipitation);
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const inputValue = inputForm.value.trim();
  if (!inputValue) {
    setUIState("empty", "Please, type the name of city before searching.");
    return;
  }

  searchCity(inputValue);
})

function getWeatherIcon(code) {
  switch (code) {
    case 0:
    case 1:
      return `${ICONS_PATH}icon-sunny.webp`;
    case 2:
      return `${ICONS_PATH}icon-partly-cloudy.webp`;
    case 3:
      return `${ICONS_PATH}icon-overcast.webp`;
    case 45:
      return `${ICONS_PATH}icon-fog.webp`;
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
      return `${ICONS_PATH}icon-drizzle.webp`;
    case 61:
    case 63:
    case 65:
    case 66:
    case 67:
    case 80:
    case 81:
    case 82:
      return `${ICONS_PATH}icon-rain.webp`;
    case 71:
    case 73:
    case 75:
    case 85:
    case 86:
      return `${ICONS_PATH}icon-snow.webp`;
    case 95:
    case 96:
    case 99:
      return `${ICONS_PATH}icon-storm.webp`;
    default:
      return `${ICONS_PATH}icon-sunny.webp`;
  }
}

function formatTemp(celsiusValue) {
  if (currentUnits.temperature === 'fahrenheit') {
    const fahrenheit = Math.round((celsiusValue * 9) / 5 + 32);
    return `${fahrenheit}°`;
  }
  return `${Math.round(celsiusValue)}°`;
}

function formatWind(kmhValue) {
  if (currentUnits.wind === 'mph') {
    const mph = Math.round(kmhValue / 1.609);
    return `${mph} mph`;
  }
  return `${Math.round(kmhValue)} km/h`;
}

function formatPrecipitation(mmValue) {
  if (currentUnits.precipitation === 'in') {
    const inches = (mmValue / 25.4).toFixed(2);
    return `${inches} in`;
  }
  return `${mmValue} mm`;
}

function renderAllUI(data) {
  if (!data) return;

  currentTemperature.textContent = formatTemp(data.current.temperature_2m);
  currentResultValues[0].textContent = formatTemp(data.current.temperature_2m);
  currentResultValues[1].textContent = `${data.current.relative_humidity_2m}%`;
  currentResultValues[2].textContent = formatWind(data.current.wind_speed_10m);
  currentResultValues[3].textContent = formatPrecipitation(data.current.precipitation);

  for (let i = 0; i < dailyForecastItems.length; i++) {
    const item = dailyForecastItems[i];
    item.querySelector(".daily-forecast__temperature-max").textContent = formatTemp(data.daily.temperature_2m_max[i]);
    item.querySelector(".daily-forecast__temperature-min").textContent = formatTemp(data.daily.temperature_2m_min[i]);
  }

  renderHourlyForecast(currentActiveDayIndex, data);
}

function renderHourlyForecast(dayIndex, data) {
  hourlyList.innerHTML = "";

  const hourlyTimes = data.hourly.time;
  const hourlyTemperatures = data.hourly.temperature_2m;
  const hourlyWeatherCodes = data.hourly.weather_code;

  let startHourIndex = dayIndex * 24;
  let endHourIndex = startHourIndex + 24;

  if(dayIndex === 0) {
    const currentHour = new Date().getHours();
    const foundIndex = hourlyTimes.findIndex(time => new Date(time).getHours() === currentHour);
    if (foundIndex !== -1) {
      startHourIndex = foundIndex;
    }
  }

  const fragment = document.createDocumentFragment();

  for (let i = startHourIndex; i < endHourIndex; i++) {
    const timeString = hourlyTimes[i];
    const tempFormatted = formatTemp(hourlyTemperatures[i]);
    const code = hourlyWeatherCodes[i];

    const dateObj = new Date(timeString);
    const formattedHour = dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
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

async function getWeather(latitude, longitude) {
  const url = `${WEATHER_BASE_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,precipitation&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&hourly=temperature_2m,weather_code`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Network error: status ${response.status}`);
    }

    const data = await response.json();
    currentWeatherData = data;
    currentActiveDayIndex = 0;

    currentDate.textContent = formattedDatetime;
    currentIcon.src = getWeatherIcon(data.current.weather_code);

    hourlyDayMenu.innerHTML = "";
    hourlyDayMenu.setAttribute("hidden", "");
    hourlyForecastBtn.setAttribute("aria-expanded", "false");

    for (let i = 0; i < dailyForecastItems.length; i++) {
      const item = dailyForecastItems[i];
      const [year, month, day] = data.daily.time[i].split("-");
      const date = new Date(year, month - 1, day);

      const formattedDayShort = date.toLocaleDateString('en-US', {
        weekday: 'short'
      });
      const formattedDayLong = date.toLocaleDateString('en-US', {
        weekday: 'long'
      });

      item.querySelector(".daily-forecast__icon").src = getWeatherIcon(data.daily.weather_code[i]);
      item.querySelector(".daily-forecast__day").textContent = formattedDayShort;

      if (i === 0) {
        hourlyForecastDayText.textContent = formattedDayLong;
      }

      const optionBtn = document.createElement("button");
      optionBtn.type = "button";
      optionBtn.classList.add("hourly-forecast__option");
      optionBtn.textContent = formattedDayLong;

      optionBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        currentActiveDayIndex = i;
        hourlyForecastDayText.textContent = formattedDayLong;
        renderHourlyForecast(i, data);
        
        hourlyDayMenu.setAttribute("hidden", "");
        hourlyForecastBtn.setAttribute("aria-expanded", "false");
      });

      hourlyDayMenu.appendChild(optionBtn);
    }

    renderAllUI(data);

    return {data};
  } catch (error) {
    console.error("An error occurred while fetching the data:", error.message);
    throw error;
  }
}

function clearDropdown() {
  if (cityDropdown) {
    cityDropdown.innerHTML = "";
    cityDropdown.classList.add("hidden");
  }

  if (inputForm) {
    inputForm.setAttribute("aria-expanded", "false");
  }
}

async function fetchCitySuggestions(query) {
  const url = `${GEOCODING_BASE_URL}?name=${encodeURIComponent(query)}&count=5&language=pt&format=json`;

  try {
    const response = await fetch(url);
    if (!response.ok) return;

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      clearDropdown();
      return;
    }

    renderDropdownSuggestions(data.results);
  } catch (error) {
    console.error("Error fetching city suggestions:", error.message);
    clearDropdown();
  }
}

function renderDropdownSuggestions(cities) {
  if (!cityDropdown) return;

  cityDropdown.innerHTML = "";

  cities.forEach(city => {
    const li = document.createElement("li");
    li.classList.add("city-dropdown__item");
    li.setAttribute("role", "option");

    const optionBtn = document.createElement("button");
    optionBtn.type = "button";
    optionBtn.classList.add("city-dropdown__button");

    const cityName = city.name;
    const countryName = city.country ? `, ${city.country}` : "";
    const fullLocation = `${cityName}${countryName}`;

    optionBtn.textContent = fullLocation;

    optionBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      inputForm.value = fullLocation;
      clearDropdown();

      lastSearchedCity = fullLocation;
      setUIState("loading");
      currentLocation.textContent = fullLocation;
      
      getWeather(city.latitude, city.longitude)
        .then(() => setUIState("success"))
        .catch(() => setUIState("api-error"));
    });

    li.appendChild(optionBtn);
    cityDropdown.appendChild(li);
  });

  cityDropdown.classList.remove("hidden");

  if (inputForm) {
    inputForm.setAttribute("aria-expanded", "true");
  }
}

async function searchCity(city) {
  lastSearchedCity = city;
  setUIState("loading");

  const url = `${GEOCODING_BASE_URL}?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Network error: status ${response.status}`);
    }
    
    const data = await response.json();

    if(!data.results || data.results.length === 0) {
      setUIState("no-results");
      return;
    }

    const { name, country, latitude, longitude } = data.results[0];
    currentLocation.textContent = `${name}, ${country}`;

    await getWeather(latitude, longitude);
    setUIState("success");
  } catch (error) {
    console.error("An error occurred while fetching the data:", error.message);
    setUIState("api-error");
  }
}

if (retryButton) {
  retryButton.addEventListener("click", () => {
    if (lastSearchedCity) {
      searchCity(lastSearchedCity);
    } else {
      setUIState("success");
    }
  });
}

// Etapa JS 7 — estados
// - loading
// - success
// - error
// - empty

// Etapa JS 8 — acessibilidade dinâmica
// - aria-expanded
// - aria-busy
// - aria-live
// - foco
// - mensagens de erro

// Etapa JS 9 — refinamento
// - tratamento de erros
// - casos extremos
// - organização do código
// - redução de repetição