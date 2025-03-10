FROM myapp-base

COPY --chown=appuser:appuser backend/matchmaking-service/ /app/

RUN pip install -r /app/requirements.txt

EXPOSE 3005

CMD ["daphne", "-e", "ssl:3005:privateKey=/data/certs/selfsigned.key:certKey=/data/certs/selfsigned.crt", "service.asgi:application"]
