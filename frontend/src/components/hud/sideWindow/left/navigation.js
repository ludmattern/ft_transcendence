// src/components/hud/navigation.js

/**
 * Génère un élément de navigation (onglet) avec un lien.
 *
 * @param {string} label - Le label de l'onglet
 * @param {boolean} active - Si l'onglet est actif
 * @returns {string} - HTML de l'onglet
 */
export function createNavItem(label, active = false) {
  return `
	  <li class="nav-item">
	  <span class="nav-link ${
      active ? "active" : ""
    }" data-tab="${label.toLowerCase()}">
		  <a href="#" data-tab="${label.toLowerCase()}">${label}</a>
	  </span>
	  </li>`;
}
