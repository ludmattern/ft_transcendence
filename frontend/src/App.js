// frontend/src/App.js
import React from 'react';
import './App.css';
import HelloServices from './components/HelloServices'; // Importer le composant
import Authentification from './components/Auth'; // Importer le composant


function App() {
  return (
  <div className="App">
    <Authentification/> {}
	  <HelloServices /> {/* displays the message from all services */}
	</div>
  );
}

export default App;
