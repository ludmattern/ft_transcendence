FROM myapp-base

COPY --chown=appuser:appuser backend/pong-service/requirements.txt /app/
COPY --chown=appuser:appuser backend/pong-service/ /app/

RUN pip install --no-cache-dir -r requirements.txt 
# --extra-index-url https://download.pytorch.org/whl/cpu

EXPOSE 3004

CMD ["daphne", "-e", "ssl:3004:privateKey=/etc/nginx/certs/selfsigned.key:certKey=/etc/nginx/certs/selfsigned.crt", "pong.asgi:application"]


