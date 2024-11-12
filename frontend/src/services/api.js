// frontend/src/services/api.js
export async function fetchUserServiceHello() {
	const response = await fetch("http://localhost:8080/api/user-service/hello");
	const data = await response.text();
	return data;
  }
  