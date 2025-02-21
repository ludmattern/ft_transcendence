.PHONY: up down re

up:
	docker compose --env-file ./secret/.env -f docker-compose.yml up --build -d

down:
	docker compose -f docker-compose.yml down
	docker volume ls -q | xargs -r docker volume rm -f
	docker system prune -a --volumes -f
	rm -rf nginx/certs

re: down up
