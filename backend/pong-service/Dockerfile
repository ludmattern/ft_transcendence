FROM python:3.11-alpine

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apk update && \
    apk add --no-cache gcc musl-dev postgresql-dev

WORKDIR /app

COPY backend/pong-service/requirements.txt /app/

RUN pip install --no-cache-dir -r requirements.txt

COPY backend/pong-service/ /app/
COPY backend/common /app/common

EXPOSE 3004

CMD ["daphne", "-b", "0.0.0.0", "-p", "3004", "pong.asgi:application"]
