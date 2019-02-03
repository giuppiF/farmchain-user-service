FROM node:8-alpine

WORKDIR /app

COPY package.json package-lock.json /app/

RUN npm install && apk add --no-cache bash