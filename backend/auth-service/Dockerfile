FROM myapp-base

COPY --chown=appuser:appuser backend/auth-service/ /app/

RUN pip install -r /app/requirements.txt

EXPOSE 3001

CMD ["daphne", "-e", "ssl:3001:privateKey=/data/certs/selfsigned.key:certKey=/data/certs/selfsigned.crt", "auth.asgi:application"]