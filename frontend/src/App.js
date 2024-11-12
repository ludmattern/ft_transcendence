// frontend/src/App.js
import React from 'react';
import './App.css';
import HelloServices from './components/HelloServices'; // Importer le composant
import Authentification from './components/Auth'; // Importer le composant
import DisplayTable from './components/DisplayTable';

function App() {
  return (
  <div className="App">
    <Authentification/> {}
	  <HelloServices /> {/* displays the message from all services */}
	  <h1>Application Utilisateur</h1>
      <DisplayTable />
	</div>
  );
}

export default App;
