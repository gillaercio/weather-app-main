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

const unitsButton = document.querySelector(".units__button");
const unitsMenu = document.querySelector(".units__menu");
const temperatures = document.querySelectorAll('input[name="temperature"]');
const winds = document.querySelectorAll('input[name="wind"]');
const precipitations = document.querySelectorAll('input[name="precipitation"]');
const unitsToggle = document.querySelector(".units__toggle");

const form = document.querySelector(".form");
const inputForm = document.querySelector("#city");
const errorMessage = document.querySelector(".error-message");

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

let currentWeatherData = null;
let currentActiveDayIndex = 0;
let isImperial = false;

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
  form.removeAttribute("aria-busy");
  if (errorMessage) errorMessage.textContent = "";

  switch (state) {
    case "loading":
      form.setAttribute("aria-busy", "true");
      break;
    case "success":
      break;
    case "error":
    case "empty":
      if (errorMessage) errorMessage.textContent = message;
      break;
  }
}

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
})

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    unitsMenu.setAttribute("hidden", "");
    unitsButton.setAttribute("aria-expanded", "false");

    hourlyDayMenu.setAttribute("hidden", "");
    hourlyForecastBtn.setAttribute("aria-expanded", "false");
  }
})

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
      // const date = new Date(`${data.daily.time[i]}T00:00:00`);
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

async function searchCity(city) {
  setUIState("loading");
  const url = `${GEOCODING_BASE_URL}?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Network error: status ${response.status}`);
    }
    
    const data = await response.json();

    if(!data.results || data.results.length === 0) {
      // console.warn("City not found.");
      setUIState("empty", "City not found. Try searching with a different name.");
      return;
    }

    const name = data.results[0].name;
    const country = data.results[0].country;
    const latitude = data.results[0].latitude;
    const longitude = data.results[0].longitude;

    currentLocation.textContent = `${name}, ${country}`;

    await getWeather(latitude, longitude);
    setUIState("success");
  } catch (error) {
    console.error("An error occurred while fetching the data:", error.message);
    setUIState("error", "Error loading weather data. Please try again later.");
  }
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