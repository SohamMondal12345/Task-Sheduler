// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import { getWeather } from "../services/api";
// import "./Homepage.css";

// const Homepage = () => {
//   const [city, setCity] = useState("");
//   const [weather, setWeather] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const fetchWeather = async () => {
//     if (!city.trim()) {
//       setError("Please enter a city name.");
//       setWeather(null);
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     setWeather(null);

//     try {
//       const data = await getWeather(city);
//       setWeather(data);
//     } catch (err) {
//       setError("Failed to fetch weather data.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="homepage">
//       <header className="header">
//         <h1 className="logo">🌤️ Weatherly</h1>
//         <div className="nav-links">
//           <Link to="/login" className="nav-btn">Login</Link>
//           <Link to="/signup" className="nav-btn">Signup</Link>
//         </div>
//       </header>

//       <main className="main">
//         <h2 className="title">Live Weather Search</h2>

//         <div className="search-bar">
//           <input
//             type="text"
//             placeholder="Enter city (e.g., Mumbai)"
//             value={city}
//             onChange={(e) => setCity(e.target.value)}
//             className="city-input"
//           />
//           <button onClick={fetchWeather} className="search-btn">
//             Search
//           </button>
//         </div>

//         {loading && <p className="loading">🔄 Loading weather...</p>}
//         {error && <p className="error">{error}</p>}

//         {weather && weather.location && weather.current && (
//           <div className="weather-box fade-in">
//             <h3 className="location">{weather.location.name}, {weather.location.country}</h3>
//             <img
//               src={weather.current.condition.icon}
//               alt={weather.current.condition.text}
//               className="weather-icon"
//             />
//             <p className="condition">{weather.current.condition.text}</p>
//             <p className="info">
//               🌡️ {weather.current.temp_c}°C <span>|</span> 💧 {weather.current.humidity}% <span>|</span> 🌬️ {weather.current.wind_kph} kph
//             </p>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// };

// export default Homepage;
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { getWeather } from "../services/api";
import "./Homepage.css";

const Homepage = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = async () => {
    if (!city.trim()) {
      setError("Please enter a city name.");
      setWeather(null);
      return;
    }

    setLoading(true);
    setError(null);
    setWeather(null);

    try {
      const data = await getWeather(city);
      setWeather(data);
    } catch (err) {
      setError("Failed to fetch weather data.");
    } finally {
      setLoading(false);
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
          <button onClick={fetchWeather} className="search-btn">
            🔍 Search
          </button>
        </div>

        {loading && <p className="loading">🔄 Loading weather...</p>}
        {error && <p className="error">{error}</p>}

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
              🌡️ {weather.current.temp_c}°C <span>|</span> 💧 {weather.current.humidity}% <span>|</span> 🌬️ {weather.current.wind_kph} kph
            </p>
          </div>
        )}
      </main>

     
    </div>
  );
};

export default Homepage;
