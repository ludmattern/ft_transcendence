#!/bin/sh
while [ ! -f /etc/nginx/certs/selfsigned.crt ] || [ ! -f /etc/nginx/certs/selfsigned.key ]; do
    echo "Attente des certificats..."
    sleep 2
done

echo "Certificats trouvés, démarrage de Nginx."
exec "$@"
