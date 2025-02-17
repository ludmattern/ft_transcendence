FROM python:3.11-slim

RUN apt-get update && apt-get install -y gcc libpq-dev

WORKDIR /app

COPY backend/auth-service/requirements.txt /app/

RUN pip install --no-cache-dir -r requirements.txt

COPY backend/auth-service /app/

COPY backend/auth-service/entrypoint.sh /entrypoint.sh
COPY backend/common /app/common

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

CMD ["python", "manage.py", "runserver", "0.0.0.0:3001"]
