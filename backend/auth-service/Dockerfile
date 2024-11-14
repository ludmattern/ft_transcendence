# Dockerfile for auth-service microservice
# Utiliser l'image Python slim
FROM python:3.10

# Définir le répertoire de travail
WORKDIR /usr/src/app

# Copier et installer les dépendances
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code source
COPY . .

# Exposer le port (ajuster selon le service)
EXPOSE 3002

# Démarrer le serveur Django
CMD ["python", "manage.py", "runserver", "0.0.0.0:3002"]
