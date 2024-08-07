FROM bitnami/nginx:1.27.0

#RUN rm /etc/nginx/conf.d/default.conf
COPY ./sites-available/spotilisk.conf /opt/bitnami/nginx/conf/server_blocks/

COPY ./src /var/www/spotilisk