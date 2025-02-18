FROM python:3.11-slim

RUN apt-get update && apt-get install -y gcc libpq-dev

WORKDIR /app

COPY backend/pong-service/requirements.txt /app/

RUN pip install --no-cache-dir -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir "numpy==2.2.3" "cloudpickle==3.1.1"

COPY backend/pong-service/ /app/
COPY backend/common /app/common

CMD ["daphne", "-b", "0.0.0.0", "-p", "3004", "pong.asgi:application"]
