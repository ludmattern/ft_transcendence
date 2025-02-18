#!/bin/sh
set -e

echo "Appliquer les migrations..."
# python manage.py migrate

echo "Vérification des certificats SSL..."
CERT_DIR="/etc/nginx/certs"
CERT_FILE="$CERT_DIR/selfsigned.crt"
KEY_FILE="$CERT_DIR/selfsigned.key"

# Vérifier si le dossier existe
if [ ! -d "$CERT_DIR" ]; then
    echo "📁 Création du dossier des certificats : $CERT_DIR"
    mkdir -p "$CERT_DIR"
fi

# Générer les certificats s'ils n'existent pas
if [ ! -f "$CERT_FILE" ] || [ ! -f "$KEY_FILE" ]; then
    echo "🔐 Génération automatique des certificats SSL auto-signés..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$KEY_FILE" \
        -out "$CERT_FILE" \
        -subj "/C=FR/ST=RHONE/L=LYON/O=transcendence/CN=localhost"
else
    echo "✅ Certificats SSL trouvés, pas besoin de les générer."
fi

# Correction des permissions
echo "🛠 Correction des permissions des certificats..."
chmod 644 "$CERT_FILE"
chmod 600 "$KEY_FILE"

echo "🚀 Lancement de l'application avec Daphne en HTTPS..."
exec "$@"
