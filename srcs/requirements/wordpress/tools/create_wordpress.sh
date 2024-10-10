#!/bin/sh

# Vérifier si wp-config.php existe
if [ -f ./wp-config.php ]
then
    echo "wordpress already downloaded"
else
    # Télécharger WordPress
    php -r "file_put_contents('wordpress-6.5.5.tar.gz', file_get_contents('https://wordpress.org/wordpress-6.5.5.tar.gz', false, stream_context_create(['ssl' => ['verify_peer' => false, 'verify_peer_name' => false]])));"
    tar xfz wordpress-6.5.5.tar.gz
    mv wordpress/* .
    rm -rf wordpress-6.5.5.tar.gz
    rm -rf wordpress

    # Importer les variables d'environnement dans le fichier de configuration
    cp wp-config-sample.php wp-config.php
    sed -i "s/database_name_here/$MYSQL_DATABASE/g" wp-config.php
    sed -i "s/username_here/$MYSQL_USER/g" wp-config.php
    sed -i "s/password_here/$MYSQL_PASSWORD/g" wp-config.php
    sed -i "s/localhost/$MYSQL_HOSTNAME/g" wp-config.php

    # Ajouter les clés de sécurité en utilisant PHP
    php -r "
    \$config = file_get_contents('wp-config.php');
    \$secret_keys = file_get_contents('https://api.wordpress.org/secret-key/1.1/salt/', false, stream_context_create(['ssl' => ['verify_peer' => false, 'verify_peer_name' => false]]));
    \$config = str_replace('/* That\'s all, stop editing! Happy publishing. */', \$secret_keys . PHP_EOL . '/* That\'s all, stop editing! Happy publishing. */', \$config);
    file_put_contents('wp-config.php', \$config);
    "

    # Ajouter des paramètres supplémentaires à wp-config.php
    echo "define('WP_HOME', '$WORDPRESS_URL');" >> wp-config.php
    echo "define('WP_SITEURL', '$WORDPRESS_URL');" >> wp-config.php

    # Changer les permissions du répertoire de travail
    chown -R www-data:www-data /var/www/html
    chmod -R 755 /var/www/html

    # Attendre que la base de données soit prête
    echo "Waiting for MySQL to be ready..."
    sleep 5

    # Remplir la base de données avec les tables WordPress
    php -r "
    define('WP_INSTALLING', true);
    require_once 'wp-load.php';
    require_once 'wp-admin/includes/upgrade.php';
    wp_install('$WORDPRESS_TITLE', '$WORDPRESS_ADMIN_USER', '$WORDPRESS_ADMIN_EMAIL', true, '', '$WORDPRESS_ADMIN_PASSWORD');
    wp_create_user('$WORDPRESS_USER', '$WORDPRESS_USER_PASSWORD', '$WORDPRESS_USER_EMAIL');
    " 2>/dev/null
	echo "Wordpress ready."
fi

exec "$@"
