#!/bin/sh

envsubst </usr/local/etc/redis/redis.template.conf >/usr/local/etc/redis/redis.conf

exec redis-server /usr/local/etc/redis/redis.conf
