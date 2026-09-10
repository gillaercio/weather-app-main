// Etapa JS 1 — DOM
// - selecionar elementos -> testar console.log
const GEOCODING_BASE_URL = "https://geocoding-api.open-meteo.com/v1/search";
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

const datetime = new Date();
const formattedDatetime = datetime.toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'short',
  day: 'numeric',
  year: 'numeric'
});

let isImperial = false;

// Etapa JS 2 — Menu de unidades
// - abrir
// - fechar
// - selecionar
unitsButton.addEventListener("click", (e) => {
  e.stopPropagation();
  const isHidden = unitsMenu.hasAttribute("hidden");

  if (isHidden) {
    unitsMenu.removeAttribute("hidden");
    unitsButton.setAttribute("aria-expanded", "true");
  } else {
    unitsMenu.setAttribute("hidden");
    unitsButton.setAttribute("aria-expanded", "false");
  }
})

unitsToggle.addEventListener("click", () => {
  isImperial = !isImperial;
  unitsToggle.textContent = isImperial ? 'Switch to Metric': 'Switch to Imperial';
  saveSelectedTemperature();
  saveSelectedWind();
  saveSelectedPrecipitation();
})

hourlyForecastBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  const isHidden = hourlyDayMenu.hidden;

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
    unitsMenu.classList.add("hidden");
    unitsButton.setAttribute("aria-expanded", "false");
  }

  if (!hourlyForecastBtn.contains(e.target) && !hourlyDayMenu.contains(e.target)) {
    hourlyDayMenu.hidden = true;
    hourlyForecastBtn.setAttribute("aria-expanded", "false");
  }
})

function saveSelectedTemperature() {
  temperatures.forEach(temperature => {
    temperature.checked = (temperature.value === "fahrenheit") ? isImperial : !isImperial;
  });
}

function saveSelectedWind() {
  winds.forEach(wind => {
    wind.checked = (wind.value === "mph") ? isImperial : !isImperial;
  });
}

function saveSelectedPrecipitation() {
  precipitations.forEach(precipitation => {
    precipitation.checked = (precipitation.value === "in") ? isImperial : !isImperial;
  });
}

// Etapa JS 3 — formulário
// - submit -> capturar cidade -> validar entrada
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const inputValue = inputForm.value.trim();
  if (!inputValue) return;
  searchCity(inputValue);
})

// Etapa JS 4 — API
// - fetch -> async/await -> response -> JSON

// Etapa JS 5 — clima atual
// - cidade
// - data
// - temperatura
// - ícone

// Etapa JS 6 — cards
// - current results -> daily forecast -> hourly forecast

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

  for (let i = startHourIndex; i < endHourIndex; i++) {
    const timeString = hourlyTimes[i];
    const temp = Math.round(hourlyTemperatures[i]);
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
      <span class="hourly-forecast__temperature">${temp}°</span>
    `;

    hourlyList.appendChild(li);
  }
}

async function getWeather(latitude, longitude) {
  const url = `${WEATHER_BASE_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,precipitation&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&hourly=temperature_2m,weather_code`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Network error: status ${response.status}`);
    }

    const data = await response.json();

    currentDate.textContent = formattedDatetime;
    currentTemperature.textContent = `${data.current.temperature_2m}°`;
    currentResultValues[0].textContent = `${data.current.temperature_2m}°`;
    currentResultValues[1].textContent = `${data.current.relative_humidity_2m}%`;
    currentResultValues[2].textContent = `${data.current.wind_speed_10m} km/h`;
    currentResultValues[3].textContent = `${data.current.precipitation} mm`;
    currentIcon.src = getWeatherIcon(data.current.weather_code);

    renderHourlyForecast(0, data);

    hourlyDayMenu.innerHTML = "";
    hourlyDayMenu.setAttribute("hidden", "");
    hourlyForecastBtn.setAttribute("aria-expanded", "false");

    for (let i = 0; i < dailyForecastItems.length; i++) {
      const item = dailyForecastItems[i];
      const date = new Date(`${data.daily.time[i]}T00:00:00`);

      const formattedDayShort = date.toLocaleDateString('en-US', {
        weekday: 'short'
      });
      const formattedDayLong = date.toLocaleDateString('en-US', {
        weekday: 'long'
      });

      item.querySelector(".daily-forecast__icon").src = getWeatherIcon(data.daily.weather_code[i]);
      item.querySelector(".daily-forecast__day").textContent = formattedDayShort;
      item.querySelector(".daily-forecast__temperature-max").textContent = `${data.daily.temperature_2m_max[i]}°`;
      item.querySelector(".daily-forecast__temperature-min").textContent = `${data.daily.temperature_2m_min[i]}°`;

      if (i === 0) {
        hourlyForecastDayText.textContent = formattedDayLong;
      }

      const optionBtn = document.createElement("button");
      optionBtn.type = "button";
      optionBtn.classList.add("hourly-forecast__option");
      optionBtn.textContent = formattedDayLong;

      optionBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        hourlyForecastDayText.textContent = formattedDayLong;
        renderHourlyForecast(i, data);
        
        hourlyDayMenu.setAttribute("hidden", "");
        hourlyForecastBtn.setAttribute("aria-expanded", "false");
      });

      hourlyDayMenu.appendChild(optionBtn);
    }

    return {data};
  } catch (error) {
    console.error("An error occurred while fetching the data:", error.message);
  }
}

async function searchCity (city) {
  const url = `${GEOCODING_BASE_URL}?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Network error: status ${response.status}`);
    }

    const data = await response.json();

    if(!data.results || data.results.length === 0) {
      console.warn("City not found.");
      return;
    }

    const name = data.results[0].name;
    const country = data.results[0].country;
    const latitude = data.results[0].latitude;
    const longitude = data.results[0].longitude;

    currentLocation.textContent = `${name}, ${country}`;

    await getWeather(latitude, longitude);
  } catch (error) {
    console.error("An error occurred while fetching the data:", error.message);
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