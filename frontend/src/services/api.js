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
