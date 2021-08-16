FROM nginx:1.13.3
MAINTAINER R.J <renjie@ascs.tech>

COPY dist/ /usr/share/nginx/html
COPY docker-entrypoint.sh /

ENV ENV_FILE_PATH=./env.js

RUN chmod +x docker-entrypoint.sh && ln -s docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN touch /etc/nginx/conf.d/addHeader.conf
RUN echo 'add_header x-tif-uid $http_x_tif_uid;' >> /etc/nginx/conf.d/addHeader.conf

WORKDIR /usr/share/nginx/html

EXPOSE 80

CMD ["/docker-entrypoint.sh"]