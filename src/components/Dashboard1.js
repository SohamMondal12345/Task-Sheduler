import React, { useEffect, useState } from 'react';
import { getWeather, unsubscribe, saveSubscription } from '../services/api'; // ✅ import saveSubscription
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [weather, setWeather] = useState(null);
  const [cityInput, setCityInput] = useState('');
  const [multiWeather, setMultiWeather] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    city: '',
    frequency: 'daily',
    time: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    getWeather("Kolkata")
      .then(data => {
        setWeather(data);
        setLoading(false);
      })
      .catch(() => {
        alert("Error fetching weather");
        localStorage.removeItem("token");
        navigate('/login');
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    alert("Logged out successfully");
    navigate('/');
  };

  const handleAddCity = async () => {
    const city = cityInput.trim();
    if (!city) return;

    try {
      const data = await getWeather(city);
      setMultiWeather(prev => [...prev, data]);
      setCityInput('');
    } catch (err) {
      alert(`Could not fetch weather for "${city}"`);
    }
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log("⏰ Schedule request submitted:", form);

    try {
      const res = await saveSubscription(form); // ✅ Send to backend
      alert(res.message || "Subscription saved successfully");
    } catch (err) {
      alert("❌ Failed to save subscription: " + err.message);
    }
  };

  const handleUnsubscribe = async () => {
    if (!form.email || !form.city) {
      return alert("Please fill in both email and city to unsubscribe.");
    }

    try {
      const res = await unsubscribe({ email: form.email, city: form.city });
      alert(res.message);
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>🌦️ Weather Dashboard</h2>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>

      {loading ? (
        <p className="loading">Loading weather for Kolkata...</p>
      ) : weather ? (
        <div className="weather-box">
          <h3>{weather.location.name}, {weather.location.country}</h3>
          <p>{weather.current.condition.text}</p>
          <p>🌡️ Temp: {weather.current.temp_c}°C</p>
          <p>💧 Humidity: {weather.current.humidity}%</p>
          <p>🌬️ Wind: {weather.current.wind_kph} kph</p>
        </div>
      ) : null}

      <div className="extra-city-section">
        <input
          type="text"
          placeholder="Enter another city"
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
          className="city-input"
        />
        <button onClick={handleAddCity} className="search-btn">Add City</button>
      </div>

      <div className="multi-weather">
        {multiWeather.map((w, idx) => (
          <div className="weather-box small" key={idx}>
            <h4>{w.location.name}</h4>
            <p>{w.current.condition.text}</p>
            <p>
              🌡️ {w.current.temp_c}°C | 💧 {w.current.humidity}% | 🌬️ {w.current.wind_kph} kph
            </p>
            <img src={w.current.condition.icon} alt={w.current.condition.text} />
          </div>
        ))}
      </div>

      {/* Email Scheduling Form */}
      <div className="form-section">
        <h3>📧 Get Weather Email Updates</h3>
        <form onSubmit={handleFormSubmit} className="schedule-form">
          <input
            type="email"
            name="email"
            placeholder="Your email"
            value={form.email}
            onChange={handleFormChange}
            required
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleFormChange}
            required
          />
          <select name="frequency" value={form.frequency} onChange={handleFormChange}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
          <input
            type="time"
            name="time"
            value={form.time}
            onChange={handleFormChange}
            required
          />
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" className="submit-btn">Subscribe</button>
            <button type="button" className="unsubscribe-btn" onClick={handleUnsubscribe}>
              Unsubscribe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;