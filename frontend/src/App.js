// frontend/src/App.js
import React from 'react';
import './App.css';
import HelloUserService from './components/HelloUserService'; // Importer le composant

function App() {
  return (
    <div className="App">
      <h1>Hello, World!</h1>
      <p>Welcome to my React application. Let's make it beautiful!</p>
	  <HelloUserService /> {/* Affiche le message du service user-service */}
	</div>
  );
}

export default App;
