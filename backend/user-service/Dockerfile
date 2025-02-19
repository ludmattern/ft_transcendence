FROM myapp-base

COPY --chown=appuser:appuser backend/user-service/requirements.txt /app/
COPY --chown=appuser:appuser backend/user-service/ /app/

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 3002

CMD ["daphne", "-e", "ssl:3002:privateKey=/data/certs/selfsigned.key:certKey=/data/certs/selfsigned.crt", "user.asgi:application"]

