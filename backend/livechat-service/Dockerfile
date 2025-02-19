FROM myapp-base

COPY --chown=appuser:appuser backend/livechat-service/ /app/

RUN pip install --no-cache-dir -r /app/requirements.txt

EXPOSE 3003

CMD ["daphne", "-e", "ssl:3003:privateKey=/data/certs/selfsigned.key:certKey=/data/certs/selfsigned.crt", "livechat.asgi:application"]
