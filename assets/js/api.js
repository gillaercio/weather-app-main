import { config } from "./config.js";

export async function fetchCitySuggestions(query) {
  const url = `${config.geocodingBaseUrl}?name=${encodeURIComponent(query)}&count=5&language=pt&format=json`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Error fetching city suggestions");
  }

  return response.json();
}

export async function fetchCityByName(city) {
  const url = `${config.geocodingBaseUrl}?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Error fetching city data");
  }

  return response.json();
}

export async function fetchWeather(latitude, longitude) {
  const url = `${config.weatherBaseUrl}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,precipitation&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&hourly=temperature_2m,weather_code`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Error fetching weather data");
  }

  return response.json();
}