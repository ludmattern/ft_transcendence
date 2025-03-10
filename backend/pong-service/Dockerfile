FROM myapp-base

COPY --chown=appuser:appuser backend/pong-service/ /app/

RUN pip install -r /app/requirements.txt 

EXPOSE 3004

CMD ["daphne", "-e", "ssl:3004:privateKey=/data/certs/selfsigned.key:certKey=/data/certs/selfsigned.crt", "pong.asgi:application"]


