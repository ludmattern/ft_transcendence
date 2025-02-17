# Utiliser l'image Python 3.11-slim
FROM python:3.11-slim

RUN apt-get update && apt-get install -y gcc libpq-dev

WORKDIR /app

COPY backend/user-service/requirements.txt /app/

RUN pip install --no-cache-dir -r requirements.txt

COPY backend/user-service/ /app/

COPY backend/user-service/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

CMD ["python", "manage.py", "runserver", "0.0.0.0:3002"]