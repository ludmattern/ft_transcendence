FROM myapp-base

COPY --chown=appuser:appuser backend/matchmaking-service/requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=appuser:appuser backend/matchmaking-service/ /app/
COPY --chown=appuser:appuser backend/common /app/common

EXPOSE 3005

CMD ["daphne", "-b", "0.0.0.0", "-p", "3005", "service.asgi:application"]
