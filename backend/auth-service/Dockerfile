FROM python:3.11-alpine

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apk update && \
    apk add --no-cache gcc musl-dev postgresql-dev

WORKDIR /app

COPY backend/auth-service/requirements.txt /app/

RUN pip install --no-cache-dir -r requirements.txt

COPY backend/auth-service /app/

COPY backend/auth-service/entrypoint.sh /entrypoint.sh
COPY backend/common /app/common

RUN chmod +x /entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["/entrypoint.sh"]

CMD ["python", "manage.py", "runserver", "0.0.0.0:3001"]
