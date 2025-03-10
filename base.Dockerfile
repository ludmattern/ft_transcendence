FROM python:3.13-alpine

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/home/appuser/.local/bin:${PATH}"

RUN apk add --no-cache gcc musl-dev postgresql-dev && \
    adduser -D appuser && mkdir -p /data/certs && \
    chown -R appuser:appuser /data/certs

WORKDIR /app

COPY --chown=appuser:appuser backend/common/requirements_common.txt /app/
RUN pip install -r requirements_common.txt
# RUN pip install --no-cache-dir -r requirements_common.txt

COPY --chown=appuser:appuser backend/common/ /app/common

USER appuser

CMD [ "echo", "Base image built" ]
