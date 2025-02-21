FROM myapp-base

COPY --chown=appuser:appuser backend/auth-service/ /app/

RUN pip install --no-cache-dir -r /app/requirements.txt

EXPOSE 3001

CMD ["daphne", "-e", "ssl:3001:privateKey=/data/certs/selfsigned.key:certKey=/data/certs/selfsigned.crt", "auth.asgi:application"]