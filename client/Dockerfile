
FROM node:18-alpine AS development

WORKDIR /app

COPY client/package.json .

COPY client/ .

COPY client/.env.docker ./.env

RUN npm install

FROM development AS build

RUN npm run build

FROM nginx:alpine

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=build /app/dist .

ENTRYPOINT ["nginx", "-g", "daemon off;"]
