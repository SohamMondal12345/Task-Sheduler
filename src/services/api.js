
// Replace these URLs with your real Lambda API endpoints
// const SIGNUP_API = "https://e6qfmihi86.execute-api.eu-north-1.amazonaws.com/default/signup";
const SIGNUP_API = "https://apob3f04x3.execute-api.eu-north-1.amazonaws.com/default/signup";
const LOGIN_API = "https://f5bta9zddi.execute-api.eu-north-1.amazonaws.com/default/login";
const WEATHER_API = "https://api.weatherapi.com/v1/current.json";
const API_KEY = "7aacc04ea876416f8d7170130250108"; // Your key

// Signup API
export async function signup(data) {
  const res = await fetch(SIGNUP_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
}


// Login API
export async function login(data) {
  const res = await fetch(LOGIN_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
}


export async function getWeather(city = "Kolkata") {
  const res = await fetch(`${WEATHER_API}?key=${API_KEY}&q=${city}`);
  return await res.json();
}

const UNSUBSCRIBE_API = "https://7djm4y4zia.execute-api.eu-north-1.amazonaws.com/default/unsubscribe";

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
  const res = await fetch("https://7ovvcfmbq7.execute-api.eu-north-1.amazonaws.com/default/save-subscription", {
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
