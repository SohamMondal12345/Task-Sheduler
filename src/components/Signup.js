import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../services/api';
import './Signup.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    city: '',
    frequency: 'daily',
    time: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const result = await signup(formData);
      alert(result.message || 'Signup successful');
      navigate('/login');
    } catch (err) {
      alert('Signup failed');
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h2 className="signup-title">📝 Sign Up for Weather Alerts</h2>
        <form onSubmit={handleSignup} className="signup-form">
          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="input-field"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="input-field"
          />
          <input
            name="city"
            type="text"
            placeholder="Preferred City"
            onChange={handleChange}
            required
            className="input-field"
          />
          <select
            name="frequency"
            value={formData.frequency}
            onChange={handleChange}
            className="input-field"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
          <input
            name="time"
            type="time"
            onChange={handleChange}
            required
            className="input-field"
          />
          <button type="submit" className="signup-btn">Sign Up</button>
        </form>
        <p className="signup-footer">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
