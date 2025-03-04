FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY wait-for-certs.sh /wait-for-certs.sh
RUN chmod +x /wait-for-certs.sh

EXPOSE 443

ENTRYPOINT ["/wait-for-certs.sh"]
CMD ["nginx", "-g", "daemon off;"]
