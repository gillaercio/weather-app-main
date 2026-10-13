import { config } from "./config.js";

export function getWeatherIcon(code) {
  switch (code) {
    case 0:
    case 1:
      return `${config.iconsPath}icon-sunny.webp`;
    case 2:
      return `${config.iconsPath}icon-partly-cloudy.webp`;
    case 3:
      return `${config.iconsPath}icon-overcast.webp`;
    case 45:
      return `${config.iconsPath}icon-fog.webp`;
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
      return `${config.iconsPath}icon-drizzle.webp`;
    case 61:
    case 63:
    case 65:
    case 66:
    case 67:
    case 80:
    case 81:
    case 82:
      return `${config.iconsPath}icon-rain.webp`;
    case 71:
    case 73:
    case 75:
    case 85:
    case 86:
      return `${config.iconsPath}icon-snow.webp`;
    case 95:
    case 96:
    case 99:
      return `${config.iconsPath}icon-storm.webp`;
    default:
      return `${config.iconsPath}icon-sunny.webp`;
  }
}

export function formatTemp(value, unit) {
  if (unit === "fahrenheit") {
    return `${Math.round((value * 9) / 5 + 32)}°`;
  }

  return `${Math.round(value)}°`;
}

export function formatWind(value, unit) {
  if (unit === "mph") {
    return `${Math.round(value / 1.609)} mph`;
  }

  return `${Math.round(value)} km/h`;
}

export function formatPrecipitation(value, unit) {
  if (unit === "in") {
    const inches = (value / 25.4).toFixed(2);
    return `${inches} in`;
  }

  return `${value} mm`;
}