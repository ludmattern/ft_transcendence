// modules.js

/**
 * Mapping of module names to their respective file paths for dynamic import.
 * This allows for centralized management of module paths.
 */
export const modules = {
  hud: "../pages/hud/hud.js", // Path to the HUD module
  leftsidewindow: "../pages/hud/leftsidewindow.js", // Path to the sidewindow module
  rightsidewindow: "../pages/hud/rightsidewindow.js", // Path to the sidewindow module
  pongmenu: "../pages/pong/menu.js",
};

/**
 * Function to inject a component into a placeholder and dynamically load its associated JavaScript module.
 * @param {string} placeholder - The HTML tag of the placeholder to replace (e.g., 'header-placeholder').
 * @param {React.Component} component - The React component to render and inject into the placeholder.
 * @param {string} moduleName - The name of the JavaScript module to load dynamically (e.g., 'hud').
 * @param {Function} callback - A callback function to execute once the module has been successfully loaded.
 */
export function loadComponent(placeholder, component, moduleName, callback) {
  // Replace the placeholder with the provided component
  replacePlaceholder(placeholder, component, () => {
    console.debug(`${component.name} component has been rendered`);

    // Dynamically load the associated JavaScript module
    loadComponentScript(moduleName, () => {
      console.log(`${moduleName}.js loaded and initialized`);

      // Call the callback function if provided
      if (callback) callback();
    });
  });
}

/**
 * Function to replace a placeholder tag with a new component and execute a callback once the replacement is done.
 * @param {string} placeholderTag - The tag of the placeholder to be replaced (e.g., 'header-placeholder').
 * @param {React.Component} component - The React component to render and inject.
 * @param {Function} callback - A callback function to execute after the placeholder is replaced.
 */
export function replacePlaceholder(placeholderTag, component, callback) {
  const placeholder = document.querySelector(placeholderTag);

  // Check if the placeholder exists
  if (placeholder) {
    console.debug(`Replacing ${placeholderTag} with the component`);

    // Create a new element for the component and replace the placeholder
    const newElement = component();
    placeholder.replaceWith(newElement);

    // If a callback is provided, execute it
    if (callback && typeof callback === "function") {
      console.debug("Calling the callback after replacing the placeholder");
      callback();
    }
  } else {
    console.error(`No placeholder found with tag: ${placeholderTag}`);
  }
}

/**
 * Function to dynamically load a JavaScript module based on its name.
 * @param {string} moduleName - The name of the module to load (e.g., 'hud').
 * @param {Function} callback - A callback function to execute once the module has been successfully loaded.
 */
export function loadComponentScript(moduleName, callback) {
  // Get the file path of the module from the modules object
  if (moduleName === "") {
    return;
  }
  const modulePath = modules[moduleName];

  // If the module is not found, log an error and return
  if (!modulePath) {
    console.error(`Module "${moduleName}" not found.`);
    return;
  }

  // Dynamically import the module
  import(modulePath)
    .then((module) => {
      console.log(`${moduleName} loaded successfully`);

      // Execute the callback function if provided
      if (callback) callback(module);
    })
    .catch((error) => {
      console.error(`Error loading ${moduleName}:`, error);
    });
}
