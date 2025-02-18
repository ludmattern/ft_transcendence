FROM myapp-base

COPY --chown=appuser:appuser backend/pong-service/requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=appuser:appuser backend/pong-service/ /app/
COPY --chown=appuser:appuser backend/common /app/common

EXPOSE 3004

CMD ["daphne", "-b", "0.0.0.0", "-p", "3004", "pong.asgi:application"]
