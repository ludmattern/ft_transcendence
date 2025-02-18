FROM python:3.13-alpine

ENV PYTHONDONTWRITEBYTECODE=1 \
	PYTHONUNBUFFERED=1 \
	PATH="/home/appuser/.local/bin:${PATH}"

RUN apk add --no-cache gcc musl-dev postgresql-dev && \
	adduser -D appuser

WORKDIR /app

USER appuser

COPY --chown=appuser:appuser backend/common/ /app/common
