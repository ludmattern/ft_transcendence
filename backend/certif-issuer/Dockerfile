FROM python:3.13-alpine

COPY backend/certif-issuer/entrypoint.sh /entrypoint.sh

RUN apk add --no-cache openssl && \
	chmod 755 /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

CMD ["echo", "the certificates are generated"]