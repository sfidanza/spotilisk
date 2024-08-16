# Stage 1
FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2
FROM bitnami/nginx:1.27.1

COPY ./sites-available/spotilisk.conf /opt/bitnami/nginx/conf/server_blocks/

COPY --from=build /usr/src/app/target /var/www/spotilisk