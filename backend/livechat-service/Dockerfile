FROM python:3.11-slim

RUN apt-get update && apt-get install -y gcc libpq-dev

WORKDIR /app

COPY backend/livechat-service/requirements.txt /app/

RUN pip install --no-cache-dir -r requirements.txt

COPY backend/livechat-service/ /app/

COPY backend/common /app/common

CMD ["daphne", "-b", "0.0.0.0", "-p", "3003", "livechat.asgi:application"]
