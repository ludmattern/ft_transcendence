FROM python:3.11-alpine

ENV PYTHONDONTWRITEBYTECODE=1 \
	PYTHONUNBUFFERED=1 \
	PATH="/home/appuser/.local/bin:${PATH}"

RUN apk add --no-cache gcc musl-dev postgresql-dev

WORKDIR /app

RUN adduser -D appuser
USER appuser
