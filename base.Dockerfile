FROM python:3.13-alpine

ENV PYTHONDONTWRITEBYTECODE=1 \
	PYTHONUNBUFFERED=1 \
	PATH="/home/appuser/.local/bin:${PATH}"

RUN apk add --no-cache gcc musl-dev postgresql-dev && \
	adduser -D appuser && mkdir -p /data/certs && \
	chown -R appuser:appuser /data/certs

WORKDIR /app

COPY --chown=appuser:appuser backend/common/ /app/common
RUN pip install --no-cache-dir -r /app/common/requirements_common.txt

USER appuser

CMD [ "echo", "Base image built" ]