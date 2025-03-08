import { initializeWebSocket, closeWebSocket } from '/src/services/websocket.js';
import { handleRoute, resetPreviousRoutes } from '/src/services/router.js';
import componentManagers from '/src/index.js';
import { switchwindow } from '/src/3d/animation.js';
import { pushInfo, getInfo, deleteInfo } from '/src/services/infoStorage.js';

export async function isClientAuthenticated() {
	try {
		const response = await fetch('/api/auth-service/check-auth/', {
			method: 'GET',
			credentials: 'include',
		});

		if (response.status === 401) {
			return false;
		}

		const data = await response.json();
		if (!data.success) {
			return false;
		}

		await pushInfo('userId', data.id);
		await pushInfo('username', data.username);

		initializeWebSocket(data.id);
		console.log('User is authenticated!');
		return true;
	} catch (error) {
		return false;
	}
}

export async function logoutUser() {
	try {
		await deleteInfo('userId');
		await deleteInfo('username');
		await deleteInfo('tournamentMode');
		await deleteInfo('tournamentSize');
		await deleteInfo('roomCode');
		//await deleteInfo("chatHistory");
		await deleteInfo('activeTournamentTab');
		//await deleteInfo("infoTabData");
		await deleteInfo('difficulty');
		await deleteInfo('liabilityCheckbox');
		await deleteInfo('pending2FA_user');
		await deleteInfo('pending2FA_method');
		await deleteInfo('registered_user');
		sessionStorage.clear();
		const response = await fetch('/api/auth-service/logout/', {
			method: 'POST',
			credentials: 'include',
		});

		if (response.ok) {
			await closeWebSocket();
			console.log('Logout successful!');
		} else {
			console.log('Logout failed:', await response.text());
		}
	} catch (err) {
		console.log('Error during logout:', err);
	}
	resetPreviousRoutes();
	componentManagers['Pong'].cleanupComponents([]);
	switchwindow('home');
	handleRoute('/login');
}

export async function loginUser(username, password) {
	const response = await fetch('/api/auth-service/logindb/', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, password }),
		credentials: 'include',
	});

	const data = await response.json();

	if (data.success) {
		return data;
	} else {
		return data.message;
	}
}

export async function registerUser(id, password, email, is2FAEnabled, twoFAMethod, phoneNumber) {
	try {
		const response = await fetch('/api/user-service/register/', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				username: id,
				email: email,
				password: password,
				is_2fa_enabled: is2FAEnabled,
				twofa_method: is2FAEnabled ? twoFAMethod : null,
				phone_number: is2FAEnabled && twoFAMethod === 'sms' ? phoneNumber : null,
			}),
		});
		console.log(response);
		const data = await response.json();
		if (data.success) {
			return true;
		} else {
			if (data.message.includes('Username already taken')) {
				document.getElementById('error-message-id').style.display = 'block';
			} else {
				document.getElementById('error-message-id').style.display = 'none';
			}

			if (data.message.includes('Email already in use')) {
				document.getElementById('error-message-mail').style.display = 'block';
				document.getElementById('error-message-mail2').style.display = 'none';
			} else {
				document.getElementById('error-message-mail').style.display = 'none';
			}
			return false;
		}
	} catch (error) {
		console.log('Error during registration:', error);
		alert('An error occurred. Please try again later.');
		return false;
	}
}

export async function verifyTwoFACode(username, twofaCode) {
	const response = await fetch('/api/auth-service/verify-2fa/', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, twofa_code: twofaCode }),
		credentials: 'include',
	});

	const data = await response.json();
	console.log(data);
	return data;
}

export async function getUserIdFromCookieAPI() {
	try {
		const response = await fetch('/api/auth-service/get_user_id_from_cookie/');
		if (!response.ok) {
			throw new Error(`HTTP error ${response.status}`);
		}
		const data = await response.json();
		if (data.success) {
			return data.user_id;
		} else {
			console.error('Erreur dans la réponse:', data.error);
			return null;
		}
	} catch (error) {
		console.error('Erreur lors de la récupération de l\'user ID:', error);
		return null;
	}
}
