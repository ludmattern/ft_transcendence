# Makefile
CERT_DIR=./nginx/certs
CERT_KEY=$(CERT_DIR)/selfsigned.key
CERT_CRT=$(CERT_DIR)/selfsigned.crt

.PHONY: up down down-v generate-cert

# up: generate-cert
up:
	docker-compose --env-file ./secret/.env -f docker-compose.yml up --build -d

down:
	docker-compose -f docker-compose.yml down
	docker system prune -f
	docker volume prune -f
	docker network prune -f
	docker image prune -f
	docker container prune -f
	# rm -f $(CERT_KEY) $(CERT_CRT)

down-v:
	docker-compose --env-file ./secret/.env -f docker-compose.yml down -v
	docker system prune -f
	docker volume prune -f
	docker network prune -f
	docker image prune -f
	docker container prune -f
	# rm -f $(CERT_KEY) $(CERT_CRT)

generate-cert:
	mkdir -p $(CERT_DIR)
	openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
		-keyout $(CERT_KEY) \
		-out $(CERT_CRT) \
		-subj "/C=FR/ST=RHONE/L=LYON/O=transcendence/CN=localhost"
