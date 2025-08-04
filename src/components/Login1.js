import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await login(formData);
      if (res.token) {
        localStorage.setItem('token', res.token);
        alert('Login successful');
        navigate('/dashboard');
      } else {
        alert(res.message || 'Login failed');
      }
    } catch (err) {
      alert('Login error');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2 className="login-title">🔐 Login</h2>
        <form onSubmit={handleLogin} className="login-form">
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="input-field"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="input-field"
          />
          <button type="submit" className="login-btn">Login</button>
        </form>
        <p className="login-footer">
          New user? <a href="/signup">Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
