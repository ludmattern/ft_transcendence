// frontend/src/components/HelloServices.js
import React, { useEffect, useState } from 'react';
import { 
  fetchUserServiceHello,
  fetchTournamentServiceHello,
  fetchGameServiceHello,
  fetchChatServiceHello,
  fetchAuthServiceHello
} from '../services/api';

function HelloServices() {
  const [userMessage, setUserMessage] = useState("");
  const [tournamentMessage, setTournamentMessage] = useState("");
  const [gameMessage, setGameMessage] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [authMessage, setAuthMessage] = useState("");

  useEffect(() => {
    fetchUserServiceHello().then(data => setUserMessage(data));
    fetchTournamentServiceHello().then(data => setTournamentMessage(data));
    fetchGameServiceHello().then(data => setGameMessage(data));
    fetchChatServiceHello().then(data => setChatMessage(data));
    fetchAuthServiceHello().then(data => setAuthMessage(data));
  }, []);

  return (
    <div>
      <div>{userMessage}</div>
      <div>{tournamentMessage}</div>
      <div>{gameMessage}</div>
      <div>{chatMessage}</div>
      <div>{authMessage}</div>
    </div>
  );
}

export default HelloServices;
