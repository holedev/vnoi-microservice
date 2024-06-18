FROM node:18-alpine

WORKDIR /app

COPY server/*.json .

RUN rm SERVICE.json
RUN mv SERVICE.docker.json SERVICE.json

WORKDIR /app/protos

COPY server/protos/ .

WORKDIR /app/logging

COPY server/logging/package.json .

COPY server/logging/ .

RUN npm install

EXPOSE 9007

CMD ["npm", "run", "dev"]