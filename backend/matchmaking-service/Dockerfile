FROM python:3.11-alpine

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apk update && \
    apk add --no-cache gcc musl-dev postgresql-dev

WORKDIR /app

COPY backend/matchmaking-service/requirements.txt /app/

RUN pip install --no-cache-dir -r requirements.txt

COPY backend/matchmaking-service/ /app/
COPY backend/common /app/common

EXPOSE 3005

CMD ["daphne", "-b", "0.0.0.0", "-p", "3005", "service.asgi:application"]
