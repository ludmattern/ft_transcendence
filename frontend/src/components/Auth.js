import React, { useState } from 'react';
import { registerUser } from '../services/api';
import '../css/Auth.css';

function Authentication() {
  const [showRegister, setShowRegister] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
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
      console.log('Registration successful:', response);
      setErrorMessage('');
    } catch (error) {
      if (error.message.includes('Email')) {
        setErrorMessage('This email is already in use. Please choose another one.');
      } else if (error.message.includes('Username')) {
        setErrorMessage('This username is already taken. Please choose another one.');
      } else {
        setErrorMessage('An error occurred during registration. Please try again.');
      }
    }
  };
  

  const handleLoginSubmit = async (e) => {
	e.preventDefault();
	console.log('Logging in with:', loginData);
  
	try {
	  const response = await fetch('/api/auth-service/login', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(loginData),
		credentials: 'include'  // Assure que le cookie est inclus dans la requête
	  });
  
	  const data = await response.json();
  
	  if (!response.ok) {
		throw new Error(data.message || 'Erreur lors de la connexion');
	  }
  
	  console.log('Connexion réussie:', data);
	  // Mettre à jour l'état d'authentification dans le contexte ou via un state global
	} catch (error) {
	  console.error('Erreur de connexion:', error);
	}
  };
	

  const toggleForm = () => {
    setShowRegister(!showRegister);
    setErrorMessage('');
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
                minLength="6"
                pattern="^(?=.*[A-Z])(?=.*\d).{6,}$"
                title="Password must be at least 6 characters long, contain at least one uppercase letter, and one digit."                required
              />
            </div>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
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