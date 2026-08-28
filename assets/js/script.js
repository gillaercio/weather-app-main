// Etapa JS 1 — DOM
// - selecionar elementos -> testar console.log

const unitsButton = document.querySelector(".units__button");
const unitsMenu = document.querySelector(".units__menu");
const temperatures = document.querySelectorAll('input[name="temperature"]');
const winds = document.querySelectorAll('input[name="wind"]');
const precipitations = document.querySelectorAll('input[name="precipitation"]');
const unitsToggle = document.querySelector(".units__toggle");

// let selectedTemperature = "Celsius (°C)";
// let selectedWind = "km/h";
// let selectedPrecipitation = "Millimeters (mm)";
// let isImperial = false;

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

// Etapa JS 4 — API
// - fetch -> async/await -> response -> JSON

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