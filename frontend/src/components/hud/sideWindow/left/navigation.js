// src/components/hud/navigation.js

/**
 * @param {string} label
 * @param {boolean} active
 * @returns {string}
 */
export function createNavItem(label, active = false) {
	return `
	  <li class="nav-item">
	  <span class="nav-link ${active ? 'active' : ''}" data-tab="${label.toLowerCase()}">
		  <a href="#" data-tab="${label.toLowerCase()}">${label}</a>
	  </span>
	  </li>`;
}
