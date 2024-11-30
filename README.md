projet/
├───frontend/
│   ├───public/                # Contenu statique accessible par le navigateur
│   │   └───index.html         # Page principale
│   │
│   └───src/
│       ├───assets/            # Ressources statiques
│       │   ├───font/          # Polices personnalisées
│       │   ├───img/           # Images génériques
│       │   ├───models/        # Modèles 3D spécifiques aux jeux
│       │   ├───SVG/           # Fichiers SVG vectoriels
│       │   └───textures/      # Textures pour les jeux
│       │
│       ├───components/        # Composants réutilisables
│       │   ├───UI/            # Boutons, modales, etc.
│       │   ├───Menu/          # Composants spécifiques aux menus
│       │   └───Games/         # Composants spécifiques aux jeux
│       │       ├───Game1/     # Composants du jeu 1
│       │       └───Game2/     # Composants du jeu 2
│       │
│       ├───pages/             # Pages principales
│       │   ├───Menu/          # Pages de menu
│       │   │   ├───MainMenu.js
│       │   │   ├───SettingsMenu.js
│       │   │   └───CreditsMenu.js
│       │   ├───Game1/         # Pages liées au jeu 1
│       │   │   ├───Game1Intro.js
│       │   │   ├───Game1Play.js
│       │   │   └───Game1Results.js
│       │   └───Game2/         # Pages liées au jeu 2
│       │       ├───Game2Intro.js
│       │       ├───Game2Play.js
│       │       └───Game2Results.js
│       │
│       ├───services/          # Gestion des appels API
│       │   └───api.js
│       │
│       ├───hooks/             # Hooks personnalisés
│       │   └───useGameLogic.js
│       │
│       ├───contexts/          # Contexte global
│       │   └───AppContext.js
│       │
│       ├───store/             # État global
│       │   └───gameState.js   # Gestion des états des jeux
│       │
│       ├───styles/             # Dossier principal pour les styles
│       │   ├───base/           # Styles de base
│       │   │   ├───reset.css   # Réinitialisation des styles par défaut du navigateur
│       │   │   ├───variables.css  # Variables globales (couleurs, tailles, etc.)
│       │   │   ├───mixins.css     # Mixins ou fonctions réutilisables
│       │   │   └───global.css  # Styles globaux partagés dans tout le projet
│       │   │
│       │   ├───components/     # Styles spécifiques aux composants
│       │   │   ├───Button.css  # Boutons
│       │   │   ├───Modal.css   # Modales
│       │   │   └───Header.css  # Header
│       │   │
│       │   ├───pages/          # Styles spécifiques aux pages
│       │   │   ├───Menu.css    # Styles des pages de menu
│       │   │   ├───Game1.css   # Styles des pages du jeu 1
│       │   │   └───Game2.css   # Styles des pages du jeu 2
│       │   │
│       │   ├───themes/         # Thèmes personnalisés (si applicable)
│       │   │   ├───light.css   # Thème clair
│       │   │   └───dark.css    # Thème sombre
│       │   │
│       │   └───index.css       # Point d’entrée pour importer tous les styles
│       │
│       ├───utils/             # Fonctions utilitaires
│       │   ├───gameUtils.js   # Fonctions spécifiques aux jeux
│       │   └───menuUtils.js   # Fonctions spécifiques aux menus
│       │
│       ├───App.js             # Point d'entrée principal de l'application
│       └───index.js           # Entrée principale du projet
