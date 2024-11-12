# Makefile

# Commande pour lancer les containers
up:
	docker-compose -f config/docker-compose.yml up --build -d

# Commande pour arrêter les containers
down:
	docker-compose -f config/docker-compose.yml down
