// modules.js

/**
 * Mapping of module names to their respective file paths for dynamic import.
 * This allows for centralized management of module paths.
 */
export const modules = {
  leftsidewindow: '/src/pages/hud/leftsidewindow.js', // Path to the sidewindow module
  rightsidewindow: '/src/pages/hud/rightsidewindow.js', // Path to the sidewindow module
  pongmenu: '/src/pages/pong/pongmenu.js',
  subscribeForm: '/src/pages/hud/subscribeForm.js',
  loginForm: '/src/pages/hud/loginForm.js',
  settingsForm: '/src/pages/hud/settingsForm.js',
  socialForm: '/src/pages/hud/socialForm.js',
};

/**
 * Function to inject a component into a placeholder or an existing block and dynamically load its associated JavaScript module.
 * @param {string} target - The selector for the placeholder or the ID of an existing block (e.g., '#header-placeholder' or '#existing-block').
 * @param {Function} component - The function that generates the component to render and inject into the target.
 * @param {string} moduleName - The name of the JavaScript module to load dynamically (e.g., 'hud').
 * @param {Function} callback - A callback function to execute once the module has been successfully loaded.
 */
export function loadComponent(target, component, moduleName, callback) {
	// Replace the target content or the placeholder with the provided component
	replacePlaceholderOrContent(target, component, () => {
	  if (component) {
		console.debug(`${component.name} component has been rendered`)
	  };
  
	  // Dynamically load the associated JavaScript module
	  loadComponentScript(moduleName, () => {
		console.debug(`${moduleName}.js loaded and initialized`);
  
		// Call the callback function if provided
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
  
	// Check if the target element exists
	if (targetElement) {
	  console.debug(`Processing ${target}`);
  
		// If component is null, clear the content and exit
		if (!component) {
			console.debug(`Clearing content of ${target} as component is null`);
			targetElement.innerHTML = ''; // Clear the existing content
			if (callback && typeof callback === 'function') {
				console.debug('Calling the callback after clearing the target');
				callback();
			}
			return;
		}

	  // Check if the target is a placeholder (custom tag without children)
	  const isPlaceholder = targetElement.tagName.includes('-');
  
	  if (isPlaceholder) {
		// Completely replace the placeholder
		console.debug(`${target} is a placeholder. Replacing it entirely.`);
		const newElement = component();
		targetElement.replaceWith(newElement);
	  } else {
		// Update the content of the target element
		console.debug(`${target} is not a placeholder. Updating its content.`);
		targetElement.innerHTML = ''; // Clear the existing content
		const newElement = component();
		targetElement.appendChild(newElement);
	  }
  
	  // If a callback is provided, execute it
	  if (callback && typeof callback === 'function') {
		console.debug('Calling the callback after processing the target');
		callback();
	  }
	} else {
	  console.error(`No element found with selector: ${target}`);
	}
  }
  
/**
 * Function to dynamically load a JavaScript module based on its name.
 * @param {string} moduleName - The name of the module to load (e.g., 'hud').
 * @param {Function} callback - A callback function to execute once the module has been successfully loaded.
 */
export function loadComponentScript(moduleName, callback) {
  // Get the file path of the module from the modules object
  if (moduleName === '') {
    return;
  }
  const modulePath = modules[moduleName];

  // If the module is not found, log an error and return
  if (!modulePath) {
    console.error(`Module '${moduleName}' not found.`);
    return;
  }

  // Dynamically import the module
  import(modulePath)
    .then((module) => {
      console.debug(`${moduleName} loaded successfully`);

      // Execute the callback function if provided
      if (callback) callback(module);
    })
    .catch((error) => {
      console.error(`Error loading ${moduleName}:`, error);
    });
}
