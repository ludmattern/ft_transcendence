// frontend/src/App.js
import React from 'react';
import './App.css';
import HelloServices from './components/HelloServices'; // Importer le composant

function App() {
  return (
    <div className="App">
      <h1>Hello, World!</h1>
      <p>Welcome to my React application. Let's make it beautiful!</p>
	  <HelloServices /> {/* displays the message from all services */}
	</div>
  );
}

export default App;
