FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/home/appuser/.local/bin:${PATH}"

RUN apt update && apt install -y \
    gcc \
    build-essential \
    libssl-dev \
    libffi-dev \
    python3-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m appuser && mkdir -p /data/certs && \
    chown -R appuser:appuser /data/certs

WORKDIR /app

COPY --chown=appuser:appuser backend/common/requirements_common.txt /app/
RUN pip install --no-cache-dir -r requirements_common.txt

COPY --chown=appuser:appuser backend/common/ /app/common
COPY --chown=appuser:appuser backend/pong-service/ /app/

USER appuser

RUN pip install --no-cache-dir onnx onnxruntime

RUN pip install --no-cache-dir -r /app/requirements.txt

EXPOSE 3004

CMD ["daphne", "-e", "ssl:3004:privateKey=/data/certs/selfsigned.key:certKey=/data/certs/selfsigned.crt", "pong.asgi:application"]