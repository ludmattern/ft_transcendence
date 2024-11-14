import React, { useState } from 'react';
import '../css/Pong.css';

function Pong() {
  const [activeTab, setActiveTab] = useState('Jouer');
  const [gameMode, setGameMode] = useState(null);

  return (
    <div className="pong-container">
      <div className="navigation">
        <button
          className={`nav-button ${activeTab === 'Jouer' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('Jouer');
            setGameMode(null);
          }}
        >
          Jouer
        </button>
        <button
          className={`nav-button ${activeTab === 'Profil' ? 'active' : ''}`}
          onClick={() => setActiveTab('Profil')}
        >
          Profil
        </button>
        <button
          className={`nav-button ${activeTab === 'Classement' ? 'active' : ''}`}
          onClick={() => setActiveTab('Classement')}
        >
          Classement
        </button>
      </div>

      {activeTab === 'Jouer' && (
        <div className="game-options">
          <button 
            className={`game-button ${gameMode === 'solo' ? 'active' : ''}`}
            onClick={() => setGameMode('solo')} // Met à jour gameMode au lieu de activeTab
          >
            solo
          </button>
          <button 
            className={`game-button ${gameMode === 'multiplayer' ? 'active' : ''}`}
            onClick={() => setGameMode('multiplayer')}
          >
            multiplayer
          </button>
          <button 
            className={`game-button ${gameMode === 'tournament' ? 'active' : ''}`}
            onClick={() => setGameMode('tournament')}
          >
            tournament
          </button>
        </div>
      )}

      {gameMode === 'solo' && (
        <div className="Solo">
          <button className="game-button">tst</button>
        </div>
      )}
    </div>
  );
}

export default Pong;
