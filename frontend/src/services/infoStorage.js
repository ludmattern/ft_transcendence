export async function pushInfo(key, value) {
	try {
		const response = await fetch('/api/user-service/storage/push/', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ key, value }),
			credentials: 'include',
		});
		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error pushing info:', error);
	}
}

export async function getInfo(key) {
	try {
		const url = `/api/user-service/storage/get/?key=${encodeURIComponent(key)}`;

		const response = await fetch(url, {
			method: 'GET',
			credentials: 'include',
		});

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error getting info:', error);
	}
}

export async function deleteInfo(key) {
	try {
		const url = `/api/user-service/storage/delete/?key=${encodeURIComponent(key)}`;

		const response = await fetch(url, {
			method: 'DELETE',
			credentials: 'include',
		});

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error deleting info:', error);
	}
}
