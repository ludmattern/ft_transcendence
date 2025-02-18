FROM myapp-base

COPY --chown=appuser:appuser backend/livechat-service/requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=appuser:appuser backend/livechat-service/ /app/

EXPOSE 3003

CMD ["daphne", "-e", "ssl:3003:privateKey=/etc/nginx/certs/selfsigned.key:certKey=/etc/nginx/certs/selfsigned.crt", "livechat.asgi:application"]
