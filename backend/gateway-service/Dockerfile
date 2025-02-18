FROM myapp-base

COPY --chown=appuser:appuser backend/gateway-service/requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=appuser:appuser backend/gateway-service/ /app/

EXPOSE 3006

CMD ["daphne", "-b", "0.0.0.0", "-p", "3006", "gateway.asgi:application"]
