FROM myapp-base

COPY --chown=appuser:appuser backend/gateway-service/requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=appuser:appuser backend/gateway-service/ /app/

EXPOSE 3006

CMD ["daphne", "-e", "ssl:3006:privateKey=/etc/nginx/certs/selfsigned.key:certKey=/etc/nginx/certs/selfsigned.crt", "gateway.asgi:application"]
