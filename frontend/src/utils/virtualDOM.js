// const mountedComponents = {}; // Suivi des composants montés

// // Charger un composant (avec gestion des enfants)
// export function testloadComponent(target, component) {
//   // Vérifier si déjà monté
//   if (mountedComponents[component.tag]) {
//     console.debug(`${component.tag} est déjà monté.`);
//     return;
//   }

//   // Créer un conteneur pour le composant
//   const el = document.createElement("div");
//   el.dataset.component = component.tag; // Identifiant unique
//   el.innerHTML = component.render(); // Générer le contenu HTML
//   document.querySelector(target).appendChild(el);

//   // Ajouter les événements après chargement
//   if (component.attachEvents) {
//     component.attachEvents(el);
//   }

//   // Charger les composants enfants s'ils existent
//   if (component.children) {
//     component.children.forEach((child) => {
//       const childTarget = el.querySelector(`[data-slot="${child.slot}"]`);
//       if (childTarget) {
//         testloadComponent(childTarget, child.component); // Charge chaque enfant
//       }
//     });
//   }

//   // Suivi des composants montés
//   mountedComponents[component.tag] = el;
//   console.log(`${component.tag} chargé.`);
// }

// // Décharger un composant (et ses enfants)
// export function unloadComponent(tag) {
//   const el = mountedComponents[tag];
//   if (el) {
//     // Nettoyer les enfants d'abord
//     const childComponents = el.querySelectorAll("[data-component]");
//     childComponents.forEach((child) =>
//       unloadComponent(child.dataset.component)
//     );

//     // Supprimer l'élément principal
//     el.remove();
//     delete mountedComponents[tag];
//     console.log(`${tag} déchargé.`);
//   } else {
//     console.warn(`${tag} n'est pas monté.`);
//   }
// }

// // Remplacer un composant existant
// export function replaceComponent(target, component) {
//   unloadComponent(component.tag); // Décharge l'ancien
//   testloadComponent(target, component); // Charge le nouveau
// }

// // Décharge les composants inutiles
// export function cleanupComponents(requiredComponents) {
//   const mountedComponents = document.querySelectorAll("[data-component]");
//   mountedComponents.forEach((el) => {
//     const tag = el.dataset.component;
//     if (!requiredComponents.includes(tag)) {
//       unloadComponent(tag);
//     }
//   });
// }
