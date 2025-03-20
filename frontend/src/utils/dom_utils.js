export const modules = {
	leftsidewindow: '/src/pages/hud/leftsidewindow.js',
	rightsidewindow: '/src/pages/hud/rightsidewindow.js',
	pongmenu: '/src/pages/pong/pongmenu.js',
	subscribeForm: '/src/pages/hud/subscribeForm.js',
	loginForm: '/src/pages/hud/loginForm.js',
	settingsForm: '/src/pages/hud/settingsForm.js',
	socialForm: '/src/pages/hud/socialForm.js',
	footer: '/src/pages/hud/footer.js',
};

/**
 * Function to inject a component into a placeholder or an existing block and dynamically load its associated JavaScript module.
 * @param {string} target - The selector for the placeholder or the ID of an existing block (e.g., '#header-placeholder' or '#existing-block').
 * @param {Function} component - The function that generates the component to render and inject into the target.
 * @param {string} moduleName - The name of the JavaScript module to load dynamically (e.g., 'hud').
 * @param {Function} callback - A callback function to execute once the module has been successfully loaded.
 */
export function loadComponent(target, component, moduleName, callback) {
	replacePlaceholderOrContent(target, component, () => {
		loadComponentScript(moduleName, () => {
			if (callback) callback();
		});
	});
}

/**
 * Function to replace a placeholder entirely or update the content of an existing block.
 * @param {string} target - The selector for the placeholder or the ID of the block to update.
 * @param {Function} component - The function that generates the component to render and inject.
 * @param {Function} callback - A callback function to execute after the replacement is done.
 */
export function replacePlaceholderOrContent(target, component, callback) {
	const targetElement = document.querySelector(target);

	if (targetElement) {
		if (!component) {
			targetElement.innerHTML = '';
			if (callback && typeof callback === 'function') {
				callback();
			}
			return;
		}

		const isPlaceholder = targetElement.tagName.includes('-');

		if (isPlaceholder) {
			const newElement = component();
			targetElement.replaceWith(newElement);
		} else {
			targetElement.innerHTML = '';
			const newElement = component();
			targetElement.appendChild(newElement);
		}

		if (callback && typeof callback === 'function') {
			callback();
		}
	}
}

/**
 * Function to dynamically load a JavaScript module based on its name.
 * @param {string} moduleName - The name of the module to load (e.g., 'hud').
 * @param {Function} callback - A callback function to execute once the module has been successfully loaded.
 */
export function loadComponentScript(moduleName, callback) {
	if (moduleName === '') {
		return;
	}
	const modulePath = modules[moduleName];

	if (!modulePath) {
		return;
	}

	import(modulePath)
		.then((module) => {
			if (callback) callback(module);
		})
		.catch((error) => {
			console.error(`Error loading ${moduleName}:`, error);
		});
}
