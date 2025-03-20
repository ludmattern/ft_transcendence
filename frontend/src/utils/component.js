export function createComponent({ tag, render, attachEvents, children = [] }) {
	return {
		tag,
		render,
		attachEvents,
		children,
	};
}

export default class ComponentManager {
	constructor(name) {
		this.name = name;
		this.mountedComponents = {};
	}

	loadComponent(target, component) {
		if (this.mountedComponents[component.tag]) {
			if (component.tag === 'otherProfileForm') {
				this.replaceComponent(target, component);
			}
			return;
		}

		const el = document.createElement('div');
		el.dataset.component = component.tag;
		el.innerHTML = component.render();
		document.querySelector(target).appendChild(el);

		if (component.attachEvents) {
			component.attachEvents(el);
		}

		if (component.children) {
			component.children.forEach((child) => {
				const childTarget = el.querySelector(`[data-slot="${child.slot}"]`);
				if (childTarget) {
					this.loadComponent(childTarget, child.component);
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
		this.unloadComponent(component.tag);
		this.loadComponent(target, component);
	}

	cleanupComponents(requiredComponents) {
		Object.keys(this.mountedComponents).forEach((tag) => {
			if (!requiredComponents.includes(tag)) {
				this.unloadComponent(tag);
			}
		});
	}
}
