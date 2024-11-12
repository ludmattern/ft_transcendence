# Makefile

# Commande pour lancer les containers avec un fichier .env spécifique
up:
	docker-compose --env-file ./config/env/.env -f docker-compose.yml up --build -d

# Commande pour arrêter les containers
down:
	docker-compose -f docker-compose.yml down
