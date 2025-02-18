FROM python:3.11-alpine

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apk update && \
    apk add --no-cache gcc musl-dev postgresql-dev

WORKDIR /app

COPY backend/user-service/requirements.txt /app/

RUN pip install --no-cache-dir -r requirements.txt

COPY backend/user-service/ /app/

COPY backend/user-service/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

EXPOSE 3002

ENTRYPOINT ["/entrypoint.sh"]

CMD ["python", "manage.py", "runserver", "0.0.0.0:3002"]
