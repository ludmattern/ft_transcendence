#!/bin/sh

CERT_DIR=/data/certs

if [ -f "/run/secrets/hostname" ]; then
    HOSTNAME=$(cat /run/secrets/hostname | tr -d '\n')
else
    HOSTNAME="default.internal"
fi

if [ ! -f "${CERT_DIR}/selfsigned.crt" ]; then
    echo "Génération du certificat auto-signé pour $HOSTNAME..."
    mkdir -p "${CERT_DIR}"
    
    cat <<EOF > /tmp/cert.conf
[req]
default_bits       = 2048
prompt             = no
default_md         = sha256
req_extensions     = req_ext
distinguished_name = dn

[dn]
C  = FR
ST = RHONE
L  = LYON
O  = transcendence
CN = $HOSTNAME

[req_ext]
subjectAltName = @alt_names

[alt_names]
DNS.1 = $HOSTNAME
DNS.2 = localhost
DNS.3 = auth-service
DNS.4 = user-service
DNS.5 = livechat-service
DNS.6 = pong-service
DNS.7 = gateway-service
DNS.8 = matchmaking-service
DNS.9 = tournament-service
EOF

    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "${CERT_DIR}/selfsigned.key" \
        -out "${CERT_DIR}/selfsigned.crt" \
        -config /tmp/cert.conf \
        -extensions req_ext
    chmod 644 "${CERT_DIR}/selfsigned.key"
    chmod 644 "${CERT_DIR}/selfsigned.crt"
fi

exec "$@"
