export function createComponent({ tag, render, attachEvents, children = [] }) {
	return {
	  tag,              // Nom unique du composant
	  render,           // Fonction pour générer le HTML
	  attachEvents,     // Fonction pour ajouter les événements
	  children,         // Enfants imbriqués (optionnels)
	};
  }
  