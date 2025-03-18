FROM nginx:1.27-alpine

COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY wait-for-certs.sh /wait-for-certs.sh
RUN chmod +x /wait-for-certs.sh

EXPOSE 443

ENTRYPOINT ["/wait-for-certs.sh"]
CMD ["nginx", "-g", "daemon off;"]
