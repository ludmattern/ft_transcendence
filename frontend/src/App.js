import React, { useEffect, useState } from 'react';
import './css/App.css';
import HelloServices from './components/HelloServices';
import Authentification from './components/Auth';
import DisplayTable from './components/DisplayTable';
import { checkToken, logoutUser } from './services/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await checkToken();
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    verifyToken();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setIsAuthenticated(false);
      console.log('Logout successful');
    } 
    catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="App">
      {isAuthenticated ? (
        <>
          <button onClick={handleLogout}>Logout</button>
          <HelloServices />
        </>
      ) : (
        <>
          <Authentification onLogin={() => setIsAuthenticated(true)} />
          <DisplayTable />
        </>
      )}
    </div>
  );
}

export default App;
