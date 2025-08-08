import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getWeather as getCurrentWeather,
  getCurrentWeatherWithAQI as getAirQuality,
} from '../services/api';
import './Dashboard.css';

const weatherWallpapers = {
  Sunny: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80",
  Clear: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1920&q=80",
  Rain: "https://images.unsplash.com/photo-1462040700793-fcd2dbc0edf0?q=80&w=1170&auto=format&fit=crop",
  Thunderstorm: "https://images.unsplash.com/photo-1562155618-e1a8bc2eb04f?q=80&w=1191&auto=format&fit=crop",
  Cloud: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1920&q=80",
  Snow: "https://plus.unsplash.com/premium_photo-1670430004754-60d86c50fb81?q=80&w=1170&auto=format&fit=crop",
  Mist: "https://plus.unsplash.com/premium_photo-1675826774700-bda8f88f2bd2?q=80&w=1228&auto=format&fit=crop",
  Haze: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80",
  Drizzle: "https://images.unsplash.com/photo-1527766833261-b09c3163a791?auto=format&fit=crop&w=1920&q=80",
  Default: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80"
};

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [bgImage, setBgImage] = useState(weatherWallpapers.Default);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      alert("User not logged in.");
      navigate('/');
      return;
    }

    const parsedUser = JSON.parse(user);
    setUserData(parsedUser);
    fetchWeatherData(parsedUser.city);
  }, [navigate]);

  const fetchWeatherData = async (city) => {
    try {
      const [weatherData, airData] = await Promise.all([
        getCurrentWeather(city),
        getAirQuality(city),
      ]);
      setWeather(weatherData);
      setAirQuality(airData.current.air_quality);

      // Wallpaper change logic
      const condition = weatherData?.current?.condition?.text || "";
      const matchedKey = Object.keys(weatherWallpapers).find(key =>
        condition.toLowerCase().includes(key.toLowerCase())
      );
      setBgImage(weatherWallpapers[matchedKey] || weatherWallpapers.Default);

    } catch (err) {
      console.error("Failed to fetch weather data", err);
    }
  };

  const handleStopSubscription = async () => {
    if (!userData?.email) return;

    try {
      setLoading(true);
      const res = await fetch('https://3y99jmtnnk.execute-api.eu-north-1.amazonaws.com/default/stop-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userData.email }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Subscription stopped.");
        const updatedUser = { ...userData, subscribed: false };
        setUserData(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        alert(data.message || "Failed to update subscription.");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResubscribe = async () => {
    if (!userData?.email) return;

    try {
      setLoading(true);
      const res = await fetch('https://bk52t3yk2l.execute-api.eu-north-1.amazonaws.com/default/resubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userData.email }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Subscription resumed.");
        const updatedUser = { ...userData, subscribed: true };
        setUserData(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        alert(data.message || "Failed to resubscribe.");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!userData) return <p>Loading user data...</p>;

  return (
    <div
      className="dashboard"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh"
      }}
    >
      <div className="dashboard-container">
        <h2 className="dashboard-title">🌤️ Welcome Back, {userData.email.split('@')[0]}</h2>

        <div className="dashboard-grid">
          <div className="card fade-in">
            <h3>📍 City</h3>
            <p>{userData.city}</p>
          </div>
          <div className="card fade-in">
            <h3>⏰ Time</h3>
            <p>{userData.time}</p>
          </div>
          <div className="card fade-in">
            <h3>📬 Subscription</h3>
            <p>{userData.subscribed ? "Active ✅" : "Inactive ❌"}</p>
          </div>

          {weather?.current && (
            <div className="card fade-in">
              <h3><span className="glow-red">🌡️</span> Temperature</h3>
              <p>{weather.current.temp_c}°C</p>
            </div>
          )}

          {weather?.current && (
            <div className="card fade-in">
              <h3>💧 Humidity</h3>
              <p>{weather.current.humidity}%</p>
            </div>
          )}

          {weather?.current && (
            <div className="card fade-in">
              <h3><span className="glow-white">🌬️</span> Wind</h3>
              <p>{weather.current.wind_kph} kph</p>
            </div>
          )}
        </div>

        <div className="info-box fade-in">
          <p className="info-heading">Manage your subscription below:</p>

          {userData.subscribed ? (
            <button
              onClick={handleStopSubscription}
              disabled={loading}
              className="stop-btn"
            >
              {loading ? "⏳ Stopping..." : "🛑 Stop Emails"}
            </button>
          ) : (
            <button
              onClick={handleResubscribe}
              disabled={loading}
              className="subscribe-btn"
            >
              {loading ? "⏳ Subscribing..." : "📩 Resubscribe"}
            </button>
          )}

          <button onClick={handleLogout} className="logout-btn">
            🔒 Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
