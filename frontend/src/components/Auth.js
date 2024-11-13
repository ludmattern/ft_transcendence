import React, { useState } from 'react';
import { registerUser } from '../services/api';
import '../App.css';

function Authentication() {
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData({
      ...registerData,
      [name]: value,
    });
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value,
    });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    console.log('Registering with:', registerData);

    try {
      const response = await registerUser(registerData);
      console.log(' godd:', response);
    } catch (error) {
      console.error('error :', error);
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    console.log('Logging in with:', loginData);
    // Appeler la fonction de connexion ici
  };

  const toggleForm = () => {
    setShowRegister(!showRegister);
  };

  return (
    <div className="auth-container">
      {showRegister ? (
        <>
          <h2>Registration</h2>
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label htmlFor="registerUsername">Username</label>
              <input
                type="text"
                id="registerUsername"
                name="username"
                value={registerData.username}
                onChange={handleRegisterChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="registerEmail">Email</label>
              <input
                type="email"
                id="registerEmail"
                name="email"
                value={registerData.email}
                onChange={handleRegisterChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="registerPassword">Password</label>
              <input
                type="password"
                id="registerPassword"
                name="password"
                value={registerData.password}
                onChange={handleRegisterChange}
                required
              />
            </div>
            <button type="submit" className="submit-button">Sign Up</button>
          </form>
          <p className="toggle-text">
            Already have an account?{' '}
            <button className="toggle-button" onClick={toggleForm}>
              Log In
            </button>
          </p>
        </>
      ) : (
        <>
          <h2>Login</h2>
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label htmlFor="loginEmail">Email</label>
              <input
                type="text"
                id="loginEmail"
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="loginPassword">Password</label>
              <input
                type="password"
                id="loginPassword"
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                required
              />
            </div>
            <button type="submit" className="submit-button">Log In</button>
          </form>
          <p className="toggle-text">
            Don’t have an account?{' '}
            <button className="toggle-button" onClick={toggleForm}>
              Sign Up
            </button>
          </p>
        </>
      )}
    </div>
  );
}

export default Authentication;
