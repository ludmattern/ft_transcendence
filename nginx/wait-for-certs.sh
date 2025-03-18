#!/bin/sh
while [ ! -f /etc/nginx/certs/selfsigned.crt ] || [ ! -f /etc/nginx/certs/selfsigned.key ]; do
    echo "Attente des certificats..."
    sleep 2
done

echo "Certificats trouvés, démarrage de Nginx."

if [ -f /run/secrets/hostname ]; then
  export HOSTNAME_SECRET=$(cat /run/secrets/hostname)
else
  echo "No secret found for hostname"
  export HOSTNAME_SECRET="localhost"
fi

echo "Using HOSTNAME_SECRET: ${HOSTNAME_SECRET}"

envsubst '$HOSTNAME_SECRET' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

cat /etc/nginx/nginx.conf

exec "$@"
