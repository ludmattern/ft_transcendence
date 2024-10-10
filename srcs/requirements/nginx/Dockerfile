# Utiliser l'image de base Debian 11
FROM debian:11

# Installer les paquets nécessaires
RUN apt-get update && apt-get install -y \
    nginx \
    openssl \
    && apt-get clean

# Créer le répertoire pour les fichiers PID et sockets UNIX de Nginx
RUN mkdir -p /run/nginx

# Créer le répertoire et ajouter un fichier index.html
RUN mkdir -p /var/www/html

# Créer les répertoires pour les certificats SSL
RUN mkdir -p /etc/ssl/certs /etc/ssl/private

# Générer les certificats SSL auto-signés
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/ssl/private/nginx-selfsigned.key \
        -out /etc/ssl/certs/nginx-selfsigned.crt \
        -subj "/C=FR/ST=Lyon/L=Lyon/O=42 School/OU=lmattern/CN=lmattern"

# Copier le fichier de configuration Nginx
COPY ./conf/nginx.conf /etc/nginx/conf.d
COPY ./tools/fastcgi_params /etc/nginx/

# Exposer le port 443
EXPOSE 443

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
