FROM python:3.11-alpine

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Installer les dépendances système nécessaires
RUN apk update && \
    apk add --no-cache gcc musl-dev postgresql-dev

WORKDIR /app

COPY backend/gateway-service/requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/gateway-service/ /app/
COPY backend/common/ /app/common

EXPOSE 3006

CMD ["daphne", "-b", "0.0.0.0", "-p", "3006", "gateway.asgi:application"]
