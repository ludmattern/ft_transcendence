// Mini React-like library in Vanilla JavaScript

// Manage side effects
const effectsQueue = new Set();

/**
 * Creates DOM elements declaratively.
 *
 * @param {string} type - The type of the element (e.g., 'div', 'span').
 * @param {Object} [props={}] - The properties and attributes of the element.
 * @param {...any} children - The children of the element (can be elements, strings, or arrays).
 * @returns {HTMLElement} The created DOM element.
 *
 * @example
 * // Create a <div class="container"> element
 * const div = createElement('div', { className: 'container' }, 'Content');
 */
export function createElement(type, props = {}, ...children) {
    const element = document.createElement(type);

    // Add attributes or event listeners
    for (const [key, value] of Object.entries(props)) {
        if (key === 'className') {
            // Handle 'className' by converting it to 'class'
            element.setAttribute('class', value);
        } else if (key === 'htmlFor') {
            // Handle 'htmlFor' by converting it to 'for'
            element.setAttribute('for', value);
        } else if (key.startsWith('on') && typeof value === 'function') {
            // Add event listeners for props starting with 'on' (e.g., 'onClick')
            element.addEventListener(key.slice(2).toLowerCase(), value);
        } else if (value !== false && value != null) {
            // Add other attributes, ignore if value is false, null, or undefined
            element.setAttribute(key, value);
        }
    }

    // Flatten the children array in case of nested arrays
    const flatChildren = children.flat ? children.flat() : [].concat(...children);

    // Add children to the element
    flatChildren.forEach(child => {
        if (child == null || child === false) return; // Ignore null, undefined, or false children
        if (typeof child === 'string' || typeof child === 'number') {
            // If child is a string or number, create a text node
            element.appendChild(document.createTextNode(child));
        } else {
            // Otherwise, append the child element directly
            element.appendChild(child);
        }
    });

    return element;
}

/**
 * Renders a component into a specified container.
 *
 * @param {HTMLElement} component - The component to render.
 * @param {HTMLElement} container - The container in which the component will be rendered.
 *
 * @example
 * // Render a component into an element with ID 'app'
 * render(MyComponent(), document.getElementById('app'));
 */
export function render(component, container) {
    // Clear the container's content
    container.innerHTML = '';
    // Add the new component
    container.appendChild(component);

    // Run effects after rendering
    runEffects();
}

/**
 * State management with automatic re-rendering.
 *
 * @param {any} initialValue - The initial value of the state.
 * @returns {Object} An object containing getState, setState, and subscribe.
 *
 * @example
 * const { getState, setState, subscribe } = useState(0);
 * setState(getState() + 1);
 */
export function useState(initialValue) {
    let value = initialValue;
    const subscribers = new Set();

    const getState = () => value;

    const setState = newValue => {
        value = newValue;
        // Notify all subscribers to re-render
        subscribers.forEach(callback => callback());
    };

    const subscribe = callback => {
        subscribers.add(callback);
        return () => subscribers.delete(callback); // Allows unsubscribing
    };

    return { getState, setState, subscribe };
}

/**
 * Side effect management.
 *
 * @param {Function} callback - The function to execute as an effect.
 * @param {Array} dependencies - Array of dependencies to control effect execution.
 *
 * @example
 * useEffect(() => {
 *   // Effect to execute
 *   return () => {
 *     // Cleanup function
 *   };
 * }, [dependency1, dependency2]);
 */
export function useEffect(callback, dependencies) {
    const effect = {
        callback,
        dependencies,
        cleanup: null,
        prevDependencies: null
    };

    // Add the effect to the queue
    effectsQueue.add(effect);
}

// Function to run effects after rendering
function runEffects() {
    effectsQueue.forEach(effect => {
        const { callback, dependencies, cleanup, prevDependencies } = effect;

        // Check if dependencies have changed
        const hasChanged = !prevDependencies || dependencies.some((dep, i) => dep !== prevDependencies[i]);

        if (hasChanged) {
            // Call the previous cleanup function if it exists
            if (typeof cleanup === 'function') {
                cleanup();
            }
            // Execute the effect's callback and store the cleanup function
            effect.cleanup = callback();
            // Update previous dependencies
            effect.prevDependencies = dependencies;
        }
    });
}

// Clean up effects (e.g., when unmounting a component)
export function cleanupEffects() {
    effectsQueue.forEach(effect => {
        if (typeof effect.cleanup === 'function') {
            effect.cleanup();
        }
    });
    effectsQueue.clear();
}

/**
 * Lightweight routing for navigation without page reloads.
 *
 * @param {Object} routes - An object mapping paths to component functions.
 *
 * @example
 * Router({
 *   '/': HomeComponent,
 *   '/about': AboutComponent,
 *   '/404': NotFoundComponent
 * });
 */
export function Router(routes) {
    // Function to handle navigation
    const navigate = () => {
        const path = window.location.pathname;
        // Find the corresponding route or use '/404' by default
        const route = routes[path] || routes['/404'];
        // Render the route's component into the 'app' container
        render(route(), document.getElementById('app'));
    };

    // Handle browser navigation (back/forward buttons)
    window.onpopstate = navigate;

    // Event delegation to handle navigation links
    document.addEventListener('click', event => {
        // Find the closest <a> element with 'data-link' attribute
        const anchor = event.target.closest('a[data-link]');
        if (anchor) {
            event.preventDefault();
            // Update the browser's history
            window.history.pushState({}, '', anchor.href);
            // Navigate to the new route
            navigate();
        }
    });

    // Initial navigation when the page loads
    navigate();
}

/**
 * Component to create navigation links.
 *
 * @param {Object} props - The properties of the link.
 * @param {string} props.to - The URL the link points to.
 * @param {Array} props.children - The children of the link (text or elements).
 * @returns {HTMLElement} The created <a> element.
 *
 * @example
 * // Create a link to '/about'
 * Link({ to: '/about', children: ['About'] });
 */
export function Link({ to, children }) {
    // Create an <a> element with 'href' and 'data-link' attributes
    return createElement('a', { href: to, 'data-link': true }, ...children);
}

/**
 * Example component using useState and useEffect.
 *
 * @returns {HTMLElement} The Counter component.
 *
 * @example
 * // Use in rendering
 * render(Counter(), document.getElementById('app'));
 */
export function Counter() {
    const { getState, setState, subscribe } = useState(0);

    // Reference to the component's DOM element
    let componentElement;

    // Function to render the component
    const renderComponent = () => {
        const newElement = createElement(
            'div',
            {},
            createElement('p', {}, `Counter: ${getState()}`),
            createElement(
                'button',
                { onClick: () => setState(getState() + 1) },
                'Increment'
            )
        );

        // If the element already exists, replace it in the DOM
        if (componentElement) {
            componentElement.replaceWith(newElement);
        }
        componentElement = newElement;

        return newElement;
    };

    // Subscribe to state changes to re-render the component
    subscribe(renderComponent);

    // Execute the initial render of the component
    const initialElement = renderComponent();

    // Example usage of useEffect
    useEffect(() => {
        console.log('Counter component mounted');

        // Cleanup function to be called upon unmounting
        return () => {
            console.log('Counter component unmounted');
        };
    }, []); // Executed only once after the first render

    return initialElement;
}

/**
 * Example usage of Router with routes.
 *
 * @example
 * // Start the application's router
 * AppRouter();
 */
export function AppRouter() {
    const routes = {
        '/': () => createElement('h1', {}, 'Home'),
        '/about': () => createElement('h1', {}, 'About'),
        '/counter': () => Counter(),
        '/404': () => createElement('h1', {}, 'Page not found'),
    };

    // Initialize the router with the defined routes
    Router(routes);
}

/**
 * Navigation component using the Link component.
 *
 * @returns {HTMLElement} The Navigation component.
 *
 * @example
 * // Render the navigation
 * render(Navigation(), document.getElementById('navigation'));
 */
export function Navigation() {
    return createElement(
        'nav',
        {},
        createElement(
            'ul',
            {},
            createElement('li', {}, Link({ to: '/', children: ['Home'] })),
            createElement('li', {}, Link({ to: '/about', children: ['About'] })),
            createElement('li', {}, Link({ to: '/counter', children: ['Counter'] }))
        )
    );
}

/*
 * =======================================
 * Examples of using the library
 * =======================================
 */

// Example 1: Render the Navigation component and start the router
/*
import { render, AppRouter, Navigation } from './your-library-file.js';

// Render the navigation into a container
render(Navigation(), document.getElementById('navigation'));

// Start the application's router
AppRouter();
*/

// Example 2: Using useState and useEffect in a custom component
/*
function CustomComponent() {
    const { getState, setState, subscribe } = useState('Hello World');

    let componentElement;

    const renderComponent = () => {
        const newElement = createElement('div', {},
            createElement('h2', {}, getState()),
            createElement('button', {
                onClick: () => setState('Bonjour le monde')
            }, 'Change Text')
        );

        if (componentElement) {
            componentElement.replaceWith(newElement);
        }
        componentElement = newElement;

        return newElement;
    };

    subscribe(renderComponent);

    useEffect(() => {
        console.log('CustomComponent mounted');

        return () => {
            console.log('CustomComponent unmounted');
        };
    }, []);

    return renderComponent();
}

// Render the custom component
// render(CustomComponent(), document.getElementById('app'));
*/

// Example 3: FetchData component using useEffect to fetch data
/*
function FetchData() {
    const { getState, setState, subscribe } = useState('Loading...');

    let componentElement;

    const renderComponent = () => {
        const newElement = createElement('div', {}, createElement('p', {}, getState()));

        if (componentElement) {
            componentElement.replaceWith(newElement);
        }
        componentElement = newElement;

        return newElement;
    };

    subscribe(renderComponent);

    useEffect(() => {
        fetch('https://jsonplaceholder.typicode.com/posts/1')
            .then(response => response.json())
            .then(data => setState(data.title))
            .catch(error => setState('Error loading data'));
    }, []);

    return renderComponent();
}

// Render the FetchData component
// render(FetchData(), document.getElementById('app'));
*/
