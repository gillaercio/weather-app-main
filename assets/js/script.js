// Etapa JS 1 — DOM
// - selecionar elementos -> testar console.log
const GEOCODING_BASE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_BASE_URL = "https://api.open-meteo.com/v1/forecast";

const unitsButton = document.querySelector(".units__button");
const unitsMenu = document.querySelector(".units__menu");
const temperatures = document.querySelectorAll('input[name="temperature"]');
const winds = document.querySelectorAll('input[name="wind"]');
const precipitations = document.querySelectorAll('input[name="precipitation"]');
const unitsToggle = document.querySelector(".units__toggle");

const form = document.querySelector(".form");
const inputForm = document.querySelector("#city");

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
  // console.log(inputValue);
  searchCity(inputValue);
})

// Etapa JS 4 — API
// - fetch -> async/await -> response -> JSON

async function getWeather(latitude, longitude) {
  // const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`;
  const url = `${WEATHER_BASE_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Network error: status ${response.status}`);
    }

    const data = await response.json();
    const temperature = data.current.temperature_2m;
    const humidity = data.current.relative_humidity_2m;
    const wind = data.current.wind_speed_10m;

    console.log(`Temperature: ${temperature}ºC`);
    console.log(`Humidity: ${humidity}%`);
    console.log(`Wind: ${wind} km/h`);
    
    return {temperature, humidity, wind};
  } catch (error) {
    console.error("An error occurred while fetching the data:", error.message);
  }
}

async function searchCity (city) {
  // const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`;
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
    const latitude = data.results[0].latitude;
    const longitude = data.results[0].longitude;

    // console.log(`City: ${name}`);
    // console.log(`Latitude: ${latitude}`);
    // console.log(`Longitude: ${longitude}`);

    await getWeather(latitude, longitude);
  } catch (error) {
    console.error("An error occurred while fetching the data:", error.message);
  }
}

// Etapa JS 5 — clima atual
// - cidade
// - data
// - temperatura
// - ícone

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