/**
 * SDAS Weather & Satellite Precipitation Service
 * Fetches real-time weather and 6-hour rainfall forecasts for the Puttalam Dam catchment basin (8.0362° N, 79.8283° E).
 */

const PUTTALAM_LAT = 8.0362;
const PUTTALAM_LON = 79.8283;

// WMO Weather interpretation codes
const WEATHER_CODES = {
  0:  { label: 'Clear Sky', icon: '☀️' },
  1:  { label: 'Mainly Clear', icon: '🌤️' },
  2:  { label: 'Partly Cloudy', icon: '⛅' },
  3:  { label: 'Overcast', icon: '☁️' },
  51: { label: 'Light Drizzle', icon: '🌦️' },
  61: { label: 'Light Rain', icon: '🌧️' },
  63: { label: 'Moderate Rain', icon: '🌧️' },
  65: { label: 'Heavy Monsoon Rain', icon: '⛈️' },
  80: { label: 'Rain Showers', icon: '🌦️' },
  95: { label: 'Severe Thunderstorm', icon: '⚡' },
};

export async function fetchLivePuttalamWeather() {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${PUTTALAM_LAT}&longitude=${PUTTALAM_LON}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&hourly=precipitation,precipitation_probability&forecast_hours=6&timezone=auto`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Weather API returned ${response.status}`);
    const data = await response.json();

    const currentPrecip = data.current?.precipitation ?? 0.0;
    const hourlyPrecip = data.hourly?.precipitation ?? [];
    const hourlyProb = data.hourly?.precipitation_probability ?? [];

    const forecast6hSum = hourlyPrecip.reduce((acc, val) => acc + (val || 0), 0);
    const maxProb = hourlyProb.length > 0 ? Math.max(...hourlyProb) : 0;
    const weatherInfo = WEATHER_CODES[data.current?.weather_code] || { label: 'Cloudy', icon: '☁️' };

    // Early warning condition: incoming rainfall >= 30mm or probability >= 80%
    const isHeavyRainIncoming = forecast6hSum >= 30.0 || (forecast6hSum >= 15.0 && maxProb >= 75);

    return {
      success: true,
      currentTemp: data.current?.temperature_2m ?? 28.0,
      currentHumidity: data.current?.relative_humidity_2m ?? 75,
      currentRainMm: currentPrecip,
      forecast6hRainMm: parseFloat(forecast6hSum.toFixed(1)),
      maxPrecipProb: maxProb,
      windSpeedKmH: data.current?.wind_speed_10m ?? 12.0,
      conditionLabel: weatherInfo.label,
      conditionIcon: weatherInfo.icon,
      isHeavyRainIncoming,
      syncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  } catch (err) {
    console.warn('Live weather fetch failed, returning simulated baseline:', err);
    return {
      success: false,
      currentTemp: 28.5,
      currentHumidity: 78,
      currentRainMm: 0.0,
      forecast6hRainMm: 45.0, // fallback baseline
      maxPrecipProb: 80,
      windSpeedKmH: 14.0,
      conditionLabel: 'Monsoon Overcast',
      conditionIcon: '🌧️',
      isHeavyRainIncoming: true,
      syncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }
}
