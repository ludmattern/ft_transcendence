FROM python:3.13-alpine

ENV PYTHONDONTWRITEBYTECODE=1 \
	PYTHONUNBUFFERED=1 \
	PATH="/home/appuser/.local/bin:${PATH}"

RUN apk add --no-cache gcc musl-dev postgresql-dev openssl && \
	adduser -D appuser

WORKDIR /app

#USER appuser

COPY --chown=appuser:appuser backend/common/ /app/common
RUN pip install --no-cache-dir -r /app/common/requirements_common.txt

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

RUN pip install --no-cache-dir -r /app/common/requirements_common.txt

ENTRYPOINT ["/entrypoint.sh"]
