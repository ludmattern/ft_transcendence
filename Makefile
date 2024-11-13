# Makefile

CERT_DIR=./config/nginx/certs
CERT_KEY=$(CERT_DIR)/selfsigned.key
CERT_CRT=$(CERT_DIR)/selfsigned.crt

.PHONY: up down down-v generate-cert

# Commande pour démarrer les conteneurs et générer les certificats
up: generate-cert
	docker-compose --env-file ./config/env/.env -f docker-compose.yml up --build -d

# Commande pour arrêter les conteneurs et supprimer les certificats
down:
	docker-compose -f docker-compose.yml down
	rm -f $(CERT_KEY) $(CERT_CRT)

# Commande pour arrêter les conteneurs, supprimer les volumes et les certificats
down-v:
	docker-compose --env-file ./config/env/.env -f docker-compose.yml down -v
	rm -f $(CERT_KEY) $(CERT_CRT)

# Génération des certificats SSL avec les informations spécifiques
generate-cert:
	mkdir -p $(CERT_DIR)
	openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
		-keyout $(CERT_KEY) \
		-out $(CERT_CRT) \
		-subj "/C=FR/ST=RHONE/L=LYON/O=trenscendance/CN=localhost"
