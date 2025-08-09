const SIGNUP_API = "https://apob3f04x3.execute-api.eu-north-1.amazonaws.com/default/signup";
const LOGIN_API = "https://f5bta9zddi.execute-api.eu-north-1.amazonaws.com/default/login";
const UNSUBSCRIBE_API = "https://7djm4y4zia.execute-api.eu-north-1.amazonaws.com/default/unsubscribe";
const SAVE_SUB_API = "https://7ovvcfmbq7.execute-api.eu-north-1.amazonaws.com/default/save-subscription";
const WEATHER_API = "https://api.weatherapi.com/v1/current.json";
const API_KEY = "7aacc04ea876416f8d7170130250108"; // Your key

export async function signup(data) {
  const res = await fetch(SIGNUP_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function login(data) {
  const res = await fetch(LOGIN_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
}

// Current weather only
export async function getWeather(city = "Kolkata") {
  const res = await fetch(`${WEATHER_API}?key=${API_KEY}&q=${city}`);
  return await res.json();
}

// Current weather + AQI
export async function getCurrentWeatherWithAQI(city = "Kolkata") {
  const res = await fetch(`${WEATHER_API}?key=${API_KEY}&q=${city}&aqi=yes`);
  return await res.json();
}

// Hourly Forecast (next 24 hours)
export async function getHourlyForecast(city = "Kolkata") {
  const res = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&hours=24`);
  return await res.json();
}

// Weekly Forecast (next 7 days)
export async function getWeeklyForecast(city = "Kolkata") {
  const res = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=7`);
  return await res.json();
}

// Sunrise & Sunset data
export async function getSunriseSunset(city = "Kolkata") {
  const res = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=1`);
  const data = await res.json();
  return data.forecast.forecastday[0].astro;
}

export async function unsubscribe(data) {
  const res = await fetch(UNSUBSCRIBE_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Unsubscribe failed");
  }

  return res.json();
}

export async function saveSubscription(data) {
  const res = await fetch(SAVE_SUB_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Error saving subscription");
  }

  return res.json();
}

const UPDATE_USER_DETAILS_API = "https://2ncjy89z0d.execute-api.eu-north-1.amazonaws.com/default/update-user-details";

export async function updateUserDetails(data) {
  const res = await fetch(UPDATE_USER_DETAILS_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to update user details");
  }

  return res.json();
}
