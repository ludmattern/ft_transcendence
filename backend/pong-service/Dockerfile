FROM myapp-base

COPY --chown=appuser:appuser backend/pong-service/requirements.txt /app/
COPY --chown=appuser:appuser backend/pong-service/ /app/

RUN pip install --no-cache-dir -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu

EXPOSE 3004

CMD ["daphne", "-b", "0.0.0.0", "-p", "3004", "pong.asgi:application"]


