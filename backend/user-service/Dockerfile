FROM myapp-base

RUN apk add --no-cache openssl
COPY --chown=appuser:appuser backend/user-service/requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=appuser:appuser backend/user-service/ /app/
COPY --chown=appuser:appuser backend/user-service/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

EXPOSE 3002

ENTRYPOINT ["/entrypoint.sh"]
CMD ["daphne", "-e", "ssl:3002:privateKey=/data/certs/selfsigned.key:certKey=/data/certs/selfsigned.crt", "user.asgi:application"]

