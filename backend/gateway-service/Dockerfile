FROM myapp-base

COPY --chown=appuser:appuser backend/gateway-service/ /app/

RUN pip install --no-cache-dir -r /app/requirements.txt

EXPOSE 3006

CMD ["daphne", "-e", "ssl:3006:privateKey=/data/certs/selfsigned.key:certKey=/data/certs/selfsigned.crt", "gateway.asgi:application"]
