# Utiliser l'image Python 3.11-slim
FROM python:3.11-slim

# Installer les dépendances système
RUN apt-get update && apt-get install -y gcc libpq-dev

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration et de dépendances dans l'image
COPY requirements.txt /app/

# Installer les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Copier le reste de l'application
COPY . /app/

# Configurer la commande par défaut
CMD ["sh", "-c", "python manage.py migrate && daphne -b 0.0.0.0 -p 3003 livechat.asgi:application"]
