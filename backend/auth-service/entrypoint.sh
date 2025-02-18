#!/bin/sh
set -e

echo "Appliquer les migrations..."
# python manage.py migrate

echo "Lancement de l'application..."
exec "$@"
