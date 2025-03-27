const eventListeners = {};

export function subscribe(event, callback) {
	if (!eventListeners[event]) {
		eventListeners[event] = [];
	}
	if (!eventListeners[event].includes(callback)) {
		eventListeners[event].push(callback);
	}
}

export function emit(event, data) {
	if (eventListeners[event]) {
		eventListeners[event].forEach((callback) => callback(data));
	}
}
