FROM redis:7.4-alpine

RUN apk add --no-cache gettext

COPY redis.template.conf /usr/local/etc/redis/redis.template.conf
COPY entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
