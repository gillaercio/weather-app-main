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

async function getWeather(latitude, longitude) {
  const url = `${WEATHER_BASE_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,precipitation&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`;

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

    console.log(url);
    // console.log(`Temperature: ${temperature}ºC`);
    // console.log(`Humidity: ${humidity}%`);
    // console.log(`Wind: ${wind} km/h`);
    // console.log(`Weather Code: ${weatherCode}`);
    // console.log(`Precipitation: ${precipitation} mm`);
    console.log(dailyDates);
    console.log(temperatureMin);
    console.log(temperatureMax);
    console.log(dailyWeatherCodes);

    currentDate.textContent = formattedDatetime;
    currentTemperature.textContent = `${temperature}°`;
    currentResultValues[0].textContent = `${temperature}°`;
    currentResultValues[1].textContent = `${humidity}%`;
    currentResultValues[2].textContent = `${wind} km/h`;
    currentResultValues[3].textContent = `${precipitation} mm`;

    for (let i=0; i < dailyForecastItems.length; i++) {
      const item = dailyForecastItems[i];
      const date = new Date(`${dailyDates[i]}T00:00:00`);
      const formattedDay = date.toLocaleDateString('en-US', {
      weekday: 'short'
    });

      const weatherCode = dailyWeatherCodes[i];
      const dailyIcon = item.querySelector(".daily-forecast__icon");
      
    console.log(dailyDates[i], formattedDay);

      switch (weatherCode) {
        case 0:
        case 1:
          // sunny 0 1
          dailyIcon.src = `${ICONS_PATH}icon-sunny.webp`;
          break;
          
        case 2:
          // partly-cloudy 2
          dailyIcon.src = `${ICONS_PATH}icon-partly-cloudy.webp`;
          break;
          
        case 3:
          // overcast 3
          dailyIcon.src = `${ICONS_PATH}icon-overcast.webp`;
          break;

        case 45:
          // fog 45
          dailyIcon.src = `${ICONS_PATH}icon-fog.webp`;
          break;
        
        case 51:
        case 53:
        case 55:
        case 56:
        case 57:
          // drizzle 51 53 55 56 57
          dailyIcon.src = `${ICONS_PATH}icon-drizzle.webp`;
          break;

        case 61:
        case 63:
        case 65:
        case 66:
        case 67:
        case 80:
        case 81:
        case 82:
          // rain 61 63 65 66 67 80 81 82
          dailyIcon.src = `${ICONS_PATH}icon-rain.webp`;
          break;

        case 71:
        case 73:
        case 75:
        case 77:
        case 85:
        case 86:
          // snow 71 73 75 77 85 86
          dailyIcon.src = `${ICONS_PATH}icon-snow.webp`;
          break;

        case 95:
        case 96:
        case 99:
          // storm 95 96 99
          dailyIcon.src = `${ICONS_PATH}icon-storm.webp`;
          break;
          
        default:
          dailyIcon.src = `${ICONS_PATH}icon-sunny.webp`;
      }
      
      item.querySelector(".daily-forecast__day").textContent = formattedDay;
      item.querySelector(".daily-forecast__temperature-max").textContent = `${temperatureMax[i]}`;
      item.querySelector(".daily-forecast__temperature-min").textContent = `${temperatureMin[i]}`;
    }

    switch (weatherCode) {
      case 0:
      case 1:
        // sunny 0 1
        currentIcon.src = `${ICONS_PATH}icon-sunny.webp`;
        break;
        
      case 2:
        // partly-cloudy 2
        currentIcon.src = `${ICONS_PATH}icon-partly-cloudy.webp`;
        break;
        
      case 3:
        // overcast 3
        currentIcon.src = `${ICONS_PATH}icon-overcast.webp`;
        break;

      case 45:
        // fog 45
        currentIcon.src = `${ICONS_PATH}icon-fog.webp`;
        break;
      
      case 51:
      case 53:
      case 55:
      case 56:
      case 57:
        // drizzle 51 53 55 56 57
        currentIcon.src = `${ICONS_PATH}icon-drizzle.webp`;
        break;

      case 61:
      case 63:
      case 65:
      case 66:
      case 67:
      case 80:
      case 81:
      case 82:
        // rain 61 63 65 66 67 80 81 82
        currentIcon.src = `${ICONS_PATH}icon-rain.webp`;
        break;

      case 71:
      case 73:
      case 75:
      case 77:
      case 85:
      case 86:
        // snow 71 73 75 77 85 86
        currentIcon.src = `${ICONS_PATH}icon-snow.webp`;
        break;

      case 95:
      case 96:
      case 99:
        // storm 95 96 99
        currentIcon.src = `${ICONS_PATH}icon-storm.webp`;
        break;
        
      default:
        currentIcon.src = `${ICONS_PATH}icon-sunny.webp`;
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

    console.log(url);
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