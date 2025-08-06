import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getWeather as getCurrentWeather,  // maps to city weather
  getWeeklyForecast as getForecast,
  getCurrentWeatherWithAQI as getAirQuality,
  getSunriseSunset as getWeatherAlerts  // only if you're using this for alerts
} from "../services/api";
import "./Homepage.css";

const Homepage = () => {
  const [city, setCity] = useState("Kolkata");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeatherData = async (searchCity = "Kolkata") => {
    setLoading(true);
    setError(null);

    try {
      const [weatherData, forecastData, airData, alertData] = await Promise.all([
        getCurrentWeather(searchCity),
        getForecast(searchCity),
        getAirQuality(searchCity),
        getWeatherAlerts(searchCity),
      ]);

      setWeather(weatherData);
      setForecast(forecastData.forecast.forecastday);
      setAirQuality(airData.current.air_quality);
      setAlerts(alertData.alerts?.alert || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch weather data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData("Kolkata");
  }, []);

  const handleSearch = () => {
    if (city.trim()) {
      fetchWeatherData(city);
    } else {
      setError("Please enter a city name.");
    }
  };

  return (
    <div className="homepage">
      <header className="header">
        <h1 className="logo">🌤️ Weatherly</h1>
        <div className="nav-links">
          <Link to="/login" className="nav-btn">Login</Link>
          <Link to="/signup" className="nav-btn">Signup</Link>
        </div>
      </header>

      <main className="main">
        <h2 className="title">Live Weather Search</h2>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Enter city (e.g., Mumbai)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="city-input"
          />
          <button onClick={handleSearch} className="search-btn">
            🔍 Search
          </button>
        </div>

        {loading && <p className="loading">🔄 Loading weather...</p>}
        {error && <p className="error">{error}</p>}

        {/* --- CURRENT WEATHER --- */}
        {weather && weather.location && weather.current && (
          <div className="weather-card">
            <h3 className="location">{weather.location.name}, {weather.location.country}</h3>
            <img
              src={weather.current.condition.icon}
              alt={weather.current.condition.text}
              className="weather-icon"
            />
            <p className="condition">{weather.current.condition.text}</p>
            <p className="info">
              🌡️ Temp: {weather.current.temp_c}°C | 💧 Humidity: {weather.current.humidity}% | 🌬️ Wind: {weather.current.wind_kph} kph
            </p>
            <p className="info">
              🤒 Feels like: {weather.current.feelslike_c}°C | UV Index: {weather.current.uv}
            </p>
          </div>
        )}

        {/* --- FORECAST --- */}
        {forecast && forecast.length > 0 && (
          <div className="forecast-section">
            <h3>🔮 3-Day Forecast</h3>
            <div className="forecast-cards">
              {forecast.map((day) => (
                <div key={day.date} className="forecast-card">
                  <h4>{day.date}</h4>
                  <img
                    src={day.day.condition.icon}
                    alt={day.day.condition.text}
                  />
                  <p>{day.day.condition.text}</p>
                  <p>🌡️ Max: {day.day.maxtemp_c}°C</p>
                  <p>🌡️ Min: {day.day.mintemp_c}°C</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- AIR QUALITY --- */}
        {airQuality && (
          <div className="air-quality">
            <h3>🧪 Air Quality (AQI)</h3>
            <p>PM2.5: {airQuality.pm2_5.toFixed(2)}</p>
            <p>PM10: {airQuality.pm10.toFixed(2)}</p>
            <p>CO: {airQuality.co.toFixed(2)}</p>
            <p>NO₂: {airQuality.no2.toFixed(2)}</p>
          </div>
        )}

        {/* --- WEATHER ALERTS --- */}
        {alerts && alerts.length > 0 && (
          <div className="alerts">
            <h3>⚠️ Weather Alerts</h3>
            {alerts.map((alert, index) => (
              <div key={index} className="alert-card">
                <p><strong>{alert.headline}</strong></p>
                <p>{alert.desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Homepage;
