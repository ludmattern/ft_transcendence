// frontend/src/App.js
import React from 'react';
import './css/App.css';
import HelloServices from './components/HelloServices'; // Importer le composant
import Authentification from './components/Auth'; // Importer le composant
import DisplayTable from './components/DisplayTable';

function App() {
  return (
  <div className="App">
    <Authentification/> {}
	  <HelloServices /> {}
    <DisplayTable />
	</div>
  );
}

export default App;
