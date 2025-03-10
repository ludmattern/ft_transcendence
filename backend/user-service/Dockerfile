FROM myapp-base

COPY --chown=appuser:appuser backend/user-service/ /app/
COPY --chown=appuser:appuser media/ /app/media/

RUN pip install -r /app/requirements.txt

EXPOSE 3002

CMD ["daphne", "-e", "ssl:3002:privateKey=/data/certs/selfsigned.key:certKey=/data/certs/selfsigned.crt", "user.asgi:application"]
