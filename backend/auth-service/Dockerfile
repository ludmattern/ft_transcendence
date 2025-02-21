FROM myapp-base

RUN apk add --no-cache openssl
COPY --chown=appuser:appuser backend/auth-service/requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=appuser:appuser backend/auth-service/ /app/
COPY --chown=appuser:appuser backend/auth-service/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

EXPOSE 3001
#RUN chmod 644 /etc/nginx/certs/selfsigned.crt && chmod 600 /etc/nginx/certs/selfsigned.key

ENTRYPOINT ["/entrypoint.sh"]
CMD ["daphne", "-e", "ssl:3001:privateKey=/etc/nginx/certs/selfsigned.key:certKey=/etc/nginx/certs/selfsigned.crt", "auth.asgi:application"]
