import React, { useState } from 'react';
import '../App.css';

function Authentication() {
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

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    console.log('Registering with:', registerData);
    // call les func inscription ici
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    console.log('Logging in with:', loginData);
    // call les func login ici
};

  return (
    <div className="auth-container">
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

      <h2>Login</h2>
      <form onSubmit={handleLoginSubmit}>
        <div className="form-group">
          <label htmlFor="loginUsername">Email</label>
          <input
            type="text"
            id="loginUsername"
            name="username"
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
    </div>
  );
}

export default Authentication;
