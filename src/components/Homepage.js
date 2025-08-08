import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { WiStrongWind, WiHumidity } from "react-icons/wi";
import {
  getWeather as getCurrentWeather,
  getWeeklyForecast as getForecast,
  getCurrentWeatherWithAQI as getAirQuality,
  getSunriseSunset as getWeatherAlerts
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
  const [bgImage, setBgImage] = useState("");

  // Map keywords to Unsplash wallpapers
const weatherWallpapers = {
  Sunny: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80", 
  Clear: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1920&q=80",
  Rain: "https://images.unsplash.com/photo-1462040700793-fcd2dbc0edf0?q=80&w=1920&auto=format&fit=crop",
  Thunderstorm: "https://images.unsplash.com/photo-1562155618-e1a8bc2eb04f?q=80&w=1920&auto=format&fit=crop",
  Cloud: "https://images.unsplash.com/photo-1499346030926-9a72daac6c63?auto=format&fit=crop&w=1920&q=80",
  Snow: "https://plus.unsplash.com/premium_photo-1670430004754-60d86c50fb81?q=80&w=1920&auto=format&fit=crop", // updated
 Mist: "https://plus.unsplash.com/premium_photo-1675826774700-bda8f88f2bd2?q=80&w=1920&auto=format&fit=crop", // updated  Haze: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80",
  Drizzle: "https://images.unsplash.com/photo-1527766833261-b09c3163a791?auto=format&fit=crop&w=1920&q=80",
  Default: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80"
};


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

      // Choose wallpaper based on condition text
      const condition = weatherData.current.condition.text;
      const matchKey = Object.keys(weatherWallpapers).find(key =>
        condition.toLowerCase().includes(key.toLowerCase())
      );
      setBgImage(weatherWallpapers[matchKey] || weatherWallpapers.Default);

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
    <div
      className="homepage"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        transition: "background-image 1s ease-in-out"
      }}
    >
      <div className="overlay" />

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

        {weather && weather.location && weather.current && (
          <motion.div
            className="weather-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="location">{weather.location.name}, {weather.location.country}</h3>
            <img
              src={weather.current.condition.icon}
              alt={weather.current.condition.text}
              className="weather-icon"
            />
            <p className="condition">{weather.current.condition.text}</p>
            <motion.p
              className="info"
              key={weather.current.temp_c}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              🌡️ Temp: {weather.current.temp_c}°C | <WiHumidity /> {weather.current.humidity}% | <WiStrongWind /> {weather.current.wind_kph} kph
            </motion.p>
            <p className="info">
              🤒 Feels like: {weather.current.feelslike_c}°C | UV Index: {weather.current.uv}
            </p>
          </motion.div>
        )}

        {forecast && forecast.length > 0 && (
          <motion.div
            className="forecast-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h3>🔮 3-Day Forecast</h3>
            <div className="forecast-cards">
              {forecast.map((day) => (
                <motion.div
                  key={day.date}
                  className="forecast-card"
                  whileHover={{ scale: 1.05 }}
                >
                  <h4>{day.date}</h4>
                  <img
                    src={day.day.condition.icon}
                    alt={day.day.condition.text}
                  />
                  <p>{day.day.condition.text}</p>
                  <p>🌡️ Max: {day.day.maxtemp_c}°C</p>
                  <p>🌡️ Min: {day.day.mintemp_c}°C</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {airQuality && (
          <motion.div
            className="air-quality"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3>🧪 Air Quality (AQI)</h3>
            <p>PM2.5: {airQuality.pm2_5.toFixed(2)}</p>
            <p>PM10: {airQuality.pm10.toFixed(2)}</p>
            <p>CO: {airQuality.co.toFixed(2)}</p>
            <p>NO₂: {airQuality.no2.toFixed(2)}</p>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Homepage;
