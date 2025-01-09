export function fetchTabContent(tabName) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Contenu de l'onglet ${tabName}`);
    }, 500);
  });
}
