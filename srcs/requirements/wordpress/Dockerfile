# Utiliser l'image de base Debian 11
FROM debian:11

# Installer les paquets nécessaires pour WordPress et PHP-FPM
RUN apt-get update && apt-get -y install \
    php \
    php-mysql \
    php-fpm \
    php-pdo \
    && rm -rf /var/lib/apt/lists/*

# Copier le fichier de configuration de PHP-FPM
COPY ./conf/www.conf /etc/php/7.4/fpm/pool.d/www.conf

# Créer le répertoire pour permettre le démarrage de PHP
RUN mkdir /run/php

# Copier le script, donner les droits d'exécution
COPY ./tools/create_wordpress.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/create_wordpress.sh

ENTRYPOINT ["/usr/local/bin/create_wordpress.sh"]

# Définir le répertoire de travail
WORKDIR /var/www/html/

# Exposer le port 9000
EXPOSE 9000

# Lancer PHP-FPM au premier plan
CMD ["/usr/sbin/php-fpm7.4", "-F"]
