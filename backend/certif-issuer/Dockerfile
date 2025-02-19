FROM python:3.13-alpine

RUN apk add --no-cache openssl && \
    mkdir -p /data/certs && \
    chmod 755 /data/certs

COPY backend/certif-issuer/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["echo", "This is a data volume container for the certificates"]