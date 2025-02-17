#!/bin/sh
set -e  # Arrête le script si une commande échoue

echo "Appliquer les migrations..."
python manage.py migrate

echo "Lancement de l'application..."
exec "$@"  # Exécute la commande définie dans CMD
