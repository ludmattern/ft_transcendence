# Makefile

# Commande pour lancer les containers
up:
	docker-compose -f docker-compose.yml up --build -d

# Commande pour arrêter les containers
down:
	docker-compose -f docker-compose.yml down
