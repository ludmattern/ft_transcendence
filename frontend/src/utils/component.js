export function createComponent({ tag, render, attachEvents, children = [] }) {
	return {
		tag, // Nom unique du composant
		render, // Fonction pour générer le HTML
		attachEvents, // Fonction pour ajouter les événements
		children, // Enfants imbriqués (optionnels)
	};
}

export default class ComponentManager {
	constructor(name) {
		this.name = name;
		this.mountedComponents = {}; // Suivi des composants montés
	}

	loadComponent(target, component) {
		if (this.mountedComponents[component.tag]) {
			return;
		}

		const el = document.createElement('div');
		el.dataset.component = component.tag; // Identifiant unique
		el.innerHTML = component.render(); // Générer le contenu HTML
		document.querySelector(target).appendChild(el);

		if (component.attachEvents) {
			component.attachEvents(el);
		}

		if (component.children) {
			component.children.forEach((child) => {
				const childTarget = el.querySelector(`[data-slot="${child.slot}"]`);
				if (childTarget) {
					this.loadComponent(childTarget, child.component); // Charger chaque enfant
				}
			});
		}

		this.mountedComponents[component.tag] = el;
	}

	unloadComponent(tag) {
		const el = this.mountedComponents[tag];
		if (el) {
			const childComponents = el.querySelectorAll('[data-component]');
			childComponents.forEach((child) => this.unloadComponent(child.dataset.component));

			el.remove();
			delete this.mountedComponents[tag];
		}
	}

	replaceComponent(target, component) {
		this.unloadComponent(component.tag); // Décharger l'ancien
		this.loadComponent(target, component); // Charger le nouveau
	}

	cleanupComponents(requiredComponents) {
		console.log('requiredcomponent', requiredComponents);
		Object.keys(this.mountedComponents).forEach((tag) => {
			if (!requiredComponents.includes(tag)) {
				this.unloadComponent(tag);
			}
		});
	}
}
