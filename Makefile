# Build and start the Docker Compose services
up:
	docker-compose up -d

# Stop the Docker Compose services
down:
	docker-compose down

# Restart the Docker Compose services
restart: down up

# View the logs of the Docker Compose services
logs:
	docker-compose logs -f

# Build the Docker Compose services
build:
	docker-compose build

# Remove stopped containers and unused images
clean:
	docker system prune -f