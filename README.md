
# ft_transcendence
## Project structure and setup

```
ft_transcendence/
├── backend/                    # Code backend pour tous les microservices
│   ├── auth-service/           # Microservice d'authentification
│   │   ├── src/                # Code source pour l'authentification (routes, contrôleurs)
│   │   ├── tests/              # Tests unitaires et d'intégration pour auth-service
│   │   ├── package.json        # Dépendances de ce microservice
│   │   └── Dockerfile          # Dockerfile pour auth-service
│   ├── user-service/           # Microservice de gestion des utilisateurs
│   │   ├── src/                # Code source pour la gestion des utilisateurs
│   │   ├── tests/              # Tests pour user-service
│   │   ├── package.json        # Dépendances de user-service
│   │   └── Dockerfile          # Dockerfile pour user-service
│   ├── game-service/           # Microservice de jeu en temps réel
│   │   ├── src/                # Code source pour le jeu
│   │   ├── tests/              # Tests pour game-service
│   │   ├── package.json        # Dépendances de game-service
│   │   └── Dockerfile          # Dockerfile pour game-service
│   ├── chat-service/           # Microservice de chat
│   │   ├── src/                # Code source pour le chat
│   │   ├── tests/              # Tests pour chat-service
│   │   ├── package.json        # Dépendances de chat-service
│   │   └── Dockerfile          # Dockerfile pour chat-service
│   ├── tournament-service/     # Microservice de tournoi et matchmaking
│   │   ├── src/                # Code source pour tournoi et matchmaking
│   │   ├── tests/              # Tests pour tournament-service
│   │   ├── package.json        # Dépendances de tournament-service
│   │   └── Dockerfile          # Dockerfile pour tournament-service
│   └── Dockerfile              # Dockerfile général si un build groupé est envisagé
├── frontend/                   # Code frontend de l'application
│   ├── public/                 # Fichiers publics pour le frontend (index.html, favicon, etc.)
│   ├── src/                    # Dossier source du frontend React
│   │   ├── components/         # Composants React de l'interface utilisateur
│   │   ├── pages/              # Pages principales (ex: Page de jeu, Chat, etc.)
│   │   ├── services/           # Services pour les appels API
│   │   ├── hooks/              # Custom hooks pour gérer l'état et les effets
│   │   ├── App.js              # Composant principal de l'application
│   │   └── index.js            # Point d'entrée pour React
│   ├── tests/                  # Tests unitaires et d'intégration pour le frontend
│   ├── package.json            # Dépendances pour le frontend
│   └── Dockerfile              # Dockerfile pour construire le frontend
├── database/                   # Configuration des bases de données
│   ├── postgres/               # Configuration et scripts initiaux pour PostgreSQL
│   │   ├── init.sql            # Script pour créer les tables et données de base
│   │   └── backups/            # Optionnel : sauvegardes de la base PostgreSQL
│   ├── redis/                  # Configuration Redis si des configurations avancées sont nécessaires
│   │   └── redis.conf          # Exemple de fichier de configuration pour Redis
│   └── mongodb/                # Configuration MongoDB, éventuellement des scripts initiaux
│       └── init.js             # Script JavaScript pour initialiser MongoDB
├── config/                     # Configuration globale pour le projet
│   ├── nginx/                  # Configurations pour Nginx en reverse proxy
│   │   └── nginx.conf          # Fichier de configuration principal pour Nginx
│   ├── env/                    # Fichiers des variables d'environnement
│   │   ├── .env                # Variables d'environnement pour le projet
│   │   └── .env.example        # Exemple de fichier .env pour référence
│   └── docker-compose.yml      # Fichier Docker Compose pour orchestrer tous les services
├── logs/                       # Dossier pour les logs des services, utile pour le debugging
│   ├── auth-service.log        # Logs pour le service d'authentification
│   ├── user-service.log        # Logs pour le service de gestion des utilisateurs
│   ├── game-service.log        # Logs pour le service de jeu
│   ├── chat-service.log        # Logs pour le service de chat
│   └── tournament-service.log  # Logs pour le service de tournoi et matchmaking
├── Makefile                    # Makefile pour simplifier les commandes Docker (build, up, down, etc.)
└── README.md                   # Documentation du projet (instructions, configuration, utilisation)
``` 
