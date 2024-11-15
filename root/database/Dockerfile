# Utiliser l'image officielle PostgreSQL comme base
FROM postgres:17-alpine

# Copier les scripts d'initialisation (SQL) dans le conteneur
COPY postgres/init.sql /docker-entrypoint-initdb.d/
