FROM nginx:1.27

# Copier la configuration et les certificats dans l'image
COPY nginx.conf /etc/nginx/nginx.conf
COPY certs /etc/nginx/certs

# Exposer les ports HTTP et HTTPS
EXPOSE 443
