#!/bin/sh

CERT_DIR=/data/certs

if [ ! -f "${CERT_DIR}/selfsigned.crt" ]; then
    echo "Génération du certificat auto-signé..."
    mkdir -p "${CERT_DIR}"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "${CERT_DIR}/selfsigned.key" \
        -out "${CERT_DIR}/selfsigned.crt" \
        -subj "/C=FR/ST=RHONE/L=LYON/O=transcendence/CN=localhost"
	chmod 644 "${CERT_DIR}/selfsigned.key"
    chmod 644 "${CERT_DIR}/selfsigned.crt"
fi

exec "$@"
