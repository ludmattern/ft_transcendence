.PHONY: up down down-v generate-cert

up:
	docker compose --env-file ./secret/.env -f docker-compose.yml up --build -d

down:
	docker compose -f docker-compose.yml down
	docker volume ls -q | xargs -r docker volume rm -f
	docker system prune -a --volumes -f
	rm -rf nginx/certs

down-v:
	docker compose --env-file ./secret/.env -f docker-compose.yml down -v
	docker system prune -f
	docker volume prune -f
	docker network prune -f
	docker image prune -f
	docker container prune -f
	