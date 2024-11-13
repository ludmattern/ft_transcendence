// frontend/src/services/api.js
export async function fetchUserServiceHello() {
	const response = await fetch("http://localhost:8080/api/user-service/hello");
	const data = await response.text();
	return data;
  }
  
export async function fetchTournamentServiceHello() {
	const response = await fetch("http://localhost:8080/api/tournament-service/hello");
	const data = await response.text();
	return data;
}

export async function fetchGameServiceHello() {
	const response = await fetch("http://localhost:8080/api/game-service/hello");
	const data = await response.text();
	return data;
}

export async function fetchChatServiceHello() {
	const response = await fetch("http://localhost:8080/api/chat-service/hello");
	const data = await response.text();
	return data;
}

export async function fetchAuthServiceHello() {
	const response = await fetch("http://localhost:8080/api/auth-service/hello");
	const data = await response.text();
	return data;
}

// frontend/src/services/api.js
export const registerUser = async (registerData) => {
  
	const response = await fetch('http://localhost:8080/api/auth-service/register', {
	  method: 'POST',
	  headers: { 'Content-Type': 'application/json' },
	  body: JSON.stringify(registerData),
	});
    
	if (!response.ok) {
	  const errorText = await response.text();
	
	  throw new Error(errorText);
	}
  
	return await response.json();
  };
  