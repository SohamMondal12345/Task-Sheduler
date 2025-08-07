import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getWeather as getCurrentWeather,
  getCurrentWeatherWithAQI as getAirQuality,
} from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
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
  <div className="dashboard">
    <div className="dashboard-background" />
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

