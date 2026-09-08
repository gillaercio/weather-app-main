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
const hourlyList = document.querySelector(".hourly-forecast__list");

const datetime = new Date();
const formattedDatetime = datetime.toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'short',
  day: 'numeric',
  year: 'numeric'
});

// let selectedTemperature = "Celsius (°C)";
// let selectedWind = "km/h";
// let selectedPrecipitation = "Millimeters (mm)";

let isImperial = false;

// Etapa JS 2 — Menu de unidades
// - abrir
// - fechar
// - selecionar
unitsButton.addEventListener("click", () => {
  unitsMenu.classList.toggle('hidden');
})

unitsToggle.addEventListener("click", () => {
  isImperial = !isImperial;
  unitsToggle.textContent = isImperial ? 'Switch to Metric': 'Switch to Imperial';
  saveSelectedTemperature();
  saveSelectedWind();
  saveSelectedPrecipitation();
})

function saveSelectedTemperature() {
  temperatures.forEach(temperature => {
    if (temperature.value === "fahrenheit") {
      temperature.checked = isImperial;
    } else {
      temperature.checked = !isImperial;
    }
  });
}

function saveSelectedWind() {
  winds.forEach(wind => {
    if (wind.value === "mph") {
      wind.checked = isImperial;
    } else {
      wind.checked = !isImperial;
    }
  });
}

function saveSelectedPrecipitation() {
  precipitations.forEach(precipitation => {
    if (precipitation.value === "in") {
      precipitation.checked = isImperial;
    } else {
      precipitation.checked = !isImperial;
    }
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

async function getWeather(latitude, longitude) {
  const url = `${WEATHER_BASE_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,precipitation&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&hourly=temperature_2m,weather_code`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Network error: status ${response.status}`);
    }

    const data = await response.json();

    const temperature = data.current.temperature_2m;
    const humidity = data.current.relative_humidity_2m;
    const wind = data.current.wind_speed_10m;
    const weatherCode = data.current.weather_code;
    const precipitation = data.current.precipitation;

    const temperatureMin = data.daily.temperature_2m_min;
    const temperatureMax = data.daily.temperature_2m_max;
    const dailyDates = data.daily.time;
    const dailyWeatherCodes = data.daily.weather_code;
    const hourlyTimes = data.hourly.time;
    const hourlyTemperatures = data.hourly.temperature_2m;
    const hourlyWeatherCodes = data.hourly.weather_code;
    const currentHour = new Date().getHours();
    // const firstHourlyItem = document.querySelector(".hourly-forecast__item");
    // const firstHourlyItem = document.querySelector(".hourly-forecast__time");

    const currentHourIndex = hourlyTimes.findIndex(time => {
      return new Date(time).getHours() === currentHour;
    });

    // console.log(url);
    // console.log(`Temperature: ${temperature}ºC`);
    // console.log(`Humidity: ${humidity}%`);
    // console.log(`Wind: ${wind} km/h`);
    // console.log(`Weather Code: ${weatherCode}`);
    // console.log(`Precipitation: ${precipitation} mm`);
    // console.log(dailyDates);
    // console.log(temperatureMin);
    // console.log(temperatureMax);
    // console.log(dailyWeatherCodes);
    // console.log(data.hourly);
    // console.log(hourlyTimes);
    // console.log(hourlyTemperatures);
    // console.log(hourlyWeatherCodes);
    // console.log(currentHour);
    // console.log(currentHourIndex);
    // console.log("Horário: "+hourlyTimes[currentHourIndex]);
    // console.log("Temperatura: "+hourlyTemperatures[currentHourIndex]);
    // console.log(hour);

    currentDate.textContent = formattedDatetime;
    currentTemperature.textContent = `${temperature}°`;
    currentResultValues[0].textContent = `${temperature}°`;
    currentResultValues[1].textContent = `${humidity}%`;
    currentResultValues[2].textContent = `${wind} km/h`;
    currentResultValues[3].textContent = `${precipitation} mm`;
    // firstHourlyItem.textContent = hourlyTimes[currentHourIndex].slice(11,13);
    // const hour = hourlyTimes[currentHourIndex].slice(11,13);
    // const hourNumber = Number(hour);
    // firstHourlyItem.textContent = hourNumber;
    // console.log(hourNumber);
    // firstHourlyItem.textContent = formattedHour;

    currentIcon.src = getWeatherIcon(weatherCode);

    hourlyList.innerHTML = "";
    for (let i = currentHourIndex; i < 24; i++) {
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
    
    for (let i=0; i < dailyForecastItems.length; i++) {
      const item = dailyForecastItems[i];
      const date = new Date(`${dailyDates[i]}T00:00:00`);
      const formattedDay = date.toLocaleDateString('en-US', {
      weekday: 'short'
    });

      const weatherCode = dailyWeatherCodes[i];
      const dailyIcon = item.querySelector(".daily-forecast__icon");

      dailyIcon.src = getWeatherIcon(weatherCode);
      
      item.querySelector(".daily-forecast__day").textContent = formattedDay;
      item.querySelector(".daily-forecast__temperature-max").textContent = `${temperatureMax[i]}`;
      item.querySelector(".daily-forecast__temperature-min").textContent = `${temperatureMin[i]}`;
    }
    
    return {temperature, humidity, wind};
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

    // console.log(url);
    // console.log(data.results);
    // console.log(`City: ${name}`);
    // console.log(`Latitude: ${latitude}`);
    // console.log(`Longitude: ${longitude}`);
    currentLocation.textContent = `${name}, ${country}`;

    await getWeather(latitude, longitude);
  } catch (error) {
    console.error("An error occurred while fetching the data:", error.message);
  }
}

// Etapa JS 6 — cards
// - current results -> daily forecast -> hourly forecast

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