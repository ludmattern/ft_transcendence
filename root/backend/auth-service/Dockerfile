# Utiliser l'image Python 3.13-slim
FROM python:3.13-slim

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration et de dépendances dans l'image
COPY requirements.txt /app/

# Installer les dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Copier le reste de l'application
COPY . /app/

# Configurer la commande par défaut (inclut la migration et l'exécution du serveur)
CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
