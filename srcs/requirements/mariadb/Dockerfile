# Utiliser l'image de base Debian 11
FROM debian:11

# Define environment variables
ENV DEBIAN_FRONTEND=noninteractive
ARG MYSQL_DATABASE=;
ARG MYSQL_USER=;
ARG MYSQL_PASSWORD=;
ARG MYSQL_ROOT_PASSWORD=;

# Installer les paquets nécessaires
RUN apt-get update && apt-get install -y \
    mariadb-server \
    && rm -rf /var/lib/apt/lists/*

# Créer les répertoires pour le socket MySQL
RUN mkdir -p /var/run/mysqld && chown -R mysql:mysql /var/run/mysqld && chmod 777 /var/run/mysqld

# Initialisation de la base de données
RUN	service mariadb start \
&& mysql -u root -e "CREATE DATABASE ${MYSQL_DATABASE};" && \
mysql -u root -e "CREATE USER '${MYSQL_USER}'@'%' IDENTIFIED BY '${MYSQL_PASSWORD}';" && \
mysql -u root -e "GRANT ALL PRIVILEGES ON ${MYSQL_DATABASE}.* TO '${MYSQL_USER}'@'%';" && \
mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY '${MYSQL_ROOT_PASSWORD}';"

# Exposer le port 3306
EXPOSE 3306

# Démarrer MariaDB
CMD ["mysqld", "--bind-address=0.0.0.0"]