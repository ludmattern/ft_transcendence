FROM myapp-base

COPY --chown=appuser:appuser backend/livechat-service/requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=appuser:appuser backend/livechat-service/ /app/
COPY --chown=appuser:appuser backend/common /app/common

EXPOSE 3003

CMD ["daphne", "-b", "0.0.0.0", "-p", "3003", "livechat.asgi:application"]