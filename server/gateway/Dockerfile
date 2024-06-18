FROM node:18-alpine

WORKDIR /app

COPY server/*.json .

RUN rm SERVICE.json
RUN mv SERVICE.docker.json SERVICE.json

WORKDIR /app/protos

COPY server/protos/ .

WORKDIR /app/gateway

COPY server/gateway/package.json .

COPY server/gateway/ .

RUN npm install

EXPOSE 9000

CMD ["npm", "run", "dev"]