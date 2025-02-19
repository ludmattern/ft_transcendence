#!/bin/sh
set -e

echo "Appliquer les migrations..."
# python manage.py migrate

exec "$@"
