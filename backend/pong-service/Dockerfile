FROM myapp-base

COPY --chown=appuser:appuser backend/pong-service/ /app/

RUN pip install --no-cache-dir -r /app/requirements.txt 

EXPOSE 3004

CMD ["daphne", "-e", "ssl:3004:privateKey=/data/certs/selfsigned.key:certKey=/data/certs/selfsigned.crt", "pong.asgi:application"]


