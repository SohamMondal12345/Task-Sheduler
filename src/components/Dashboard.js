import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
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
  }, [navigate]);

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
      <div className="dashboard-container">
        <h2 className="dashboard-title">🌦️ Your Weather Dashboard</h2>

        <div className="info-box">
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>Password:</strong> {userData.password}</p>
          <p><strong>City:</strong> {userData.city}</p>
          <p><strong>Frequency:</strong> {userData.frequency}</p>
          <p><strong>Time:</strong> {userData.time}</p>
          <p><strong>Subscribed:</strong> {userData.subscribed ? "Yes ✅" : "No ❌"}</p>

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

          <button
            onClick={handleLogout}
            className="logout-btn"
          >
            🔒 Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
