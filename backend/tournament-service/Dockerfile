FROM myapp-base

COPY --chown=appuser:appuser backend/tournament-service/requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=appuser:appuser backend/tournament-service/ /app/

EXPOSE 3005

CMD ["daphne", "-e", "ssl:3007:privateKey=/data/certs/selfsigned.key:certKey=/data/certs/selfsigned.crt", "service.asgi:application"]
