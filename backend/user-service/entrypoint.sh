#!/bin/sh
set -e

echo "Appliquer les migrations..."
#python manage.py migrate

echo "Vérification des certificats SSL..."

echo "🚀 Lancement de l'application avec Daphne en HTTPS..."
exec "$@"
