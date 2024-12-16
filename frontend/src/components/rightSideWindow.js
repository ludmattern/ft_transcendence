import { createElement } from '/src/utils/mini_react.js';

// Generates a nav item with a link
function createNavItem(label, active = false) {
  return createElement(
    'li',
    { className: 'nav-item' },
    createElement(
      'span',
      { className: `nav-link ${active ? 'active' : ''}` },
      createElement('a', { href: '#', 'data-tab': label.toLowerCase() }, label)
    )
  );
}

let wireframeRenderer, wireframeScene, wireframeCamera;


export function initWireframeScene() {
  // Récupérer la div wireframe
  const wireframeDiv = document.getElementById('wireframe');
  if (!wireframeDiv) {
    console.error("La div avec l'ID 'wireframe' n'a pas été trouvée.");
    return;
  }

  // Initialisation de la nouvelle scène, caméra, et renderer
   wireframeScene = new THREE.Scene();
   wireframeCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000); // Rapport 1:1 car la div est carrée
   wireframeRenderer = new THREE.WebGLRenderer({ alpha: true }); // Alpha pour la transparence

  // Ajuster le renderer à la taille de la div
  const width = wireframeDiv.offsetWidth;
  const height = wireframeDiv.offsetHeight;
  wireframeRenderer.setSize(width, height);

  // Ajouter le renderer à la div
  wireframeDiv.appendChild(wireframeRenderer.domElement);

  // Exemple d'objet dans la scène wireframe
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
  const cube = new THREE.Mesh(geometry, material);
  wireframeScene.add(cube);

  // Positionner la caméra pour voir le cube
  wireframeCamera.position.z = 2;

  // Animation pour la scène wireframe


  animateWireframe();
}

function animateWireframe() {
  requestAnimationFrame(animateWireframe);

  // Faire tourner le cube
 

  // Rendu de la scène wireframe
  wireframeRenderer.render(wireframeScene, wireframeCamera);
}

export function RightSideWindow() {
  return createElement(
    'div',
    { className: 'col-md-2-5 d-flex flex-column' },
    createElement(
      'div',
      { className: 'r-side-window right-side-window' },
      createElement(
        'ul',
        { className: 'nav nav-tabs' },
        createNavItem('OVR', true),
        createNavItem('WEAP', false),
        createNavItem('PWR', false),
        createNavItem('SHLD', false),
        createElement(
          'li',
          { className: 'nav-item' },
          createElement(
            'div',
            { className: 'container' },
            createElement(
              'div',
              {
                className: 'right-side-window-expander active',
                id: 'r-sw-expander',
              },
              createElement('span', { className: 'r-line' }),

              createElement('span', { className: 'r-line' }),
              createElement('span', { className: 'r-line' })
            )
          )
        )
      ),
      createElement('div', { className: 'r-tab-content', id: 'r-tab-content' },
        createElement('div', {className: 'wireframe', id: 'wireframe'}),
      )
      
    )
  );
}

