/**
 * Commence une animation sur un élément.
 * 
 * @param {HTMLElement} target - L'élément cible.
 * @param {string} animation - Le nom de l'animation.
 * @param {number} delay - Le délai en milisecondes avant le début de l'animation.
 */
export async function startAnimation(target, animation, delay = 0) {
    const elements = target instanceof NodeList || Array.isArray(target) ? target : [target];

    setTimeout(() => {
        elements.forEach(element => {
            if (!element) return;

            element.classList.add(animation);
            element.addEventListener("animationend", () => {
                element.classList.remove(animation);
                element.style.opacity = "1";
            }, { once: true });
        });
    }, delay);
}
