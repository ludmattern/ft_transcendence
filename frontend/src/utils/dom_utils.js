// utils/dom_utils.js
export function replacePlaceholder(placeholderTag, component, callback) {
    const placeholder = document.querySelector(placeholderTag);  // Cibler le tag personnalisé
    if (placeholder) {
      console.debug(`Replacing ${placeholderTag} with the component`);
      const newElement = component();
      placeholder.replaceWith(newElement);
  
      // Appeler le callback après le remplacement
      if (callback && typeof callback === 'function') {
        console.debug('Calling the callback after replacing the placeholder');
        callback();  // Le callback est exécuté après que le remplacement soit fait
      }
    } else {
      console.error(`No placeholder found with tag: ${placeholderTag}`);
    }
  }
  