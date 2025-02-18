FROM myapp-base

COPY --chown=appuser:appuser backend/auth-service/requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=appuser:appuser backend/auth-service/ /app/
COPY --chown=appuser:appuser backend/auth-service/entrypoint.sh /entrypoint.sh
COPY --chown=appuser:appuser backend/common/ /app/common/

RUN chmod +x /entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["/entrypoint.sh"]
CMD ["python", "manage.py", "runserver", "0.0.0.0:3001"]
