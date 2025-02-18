FROM myapp-base

COPY --chown=appuser:appuser backend/user-service/requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=appuser:appuser backend/user-service/ /app/
COPY --chown=appuser:appuser backend/user-service/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

EXPOSE 3002

ENTRYPOINT ["/entrypoint.sh"]
CMD ["python", "manage.py", "runserver", "0.0.0.0:3002"]
