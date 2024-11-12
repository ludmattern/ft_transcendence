# Makefile for Docker commands
up:
	docker-compose -f config/docker-compose.yml up --build -d

down:
	docker-compose -f config/docker-compose.yml down

logs:
	docker-compose -f config/docker-compose.yml logs -f

