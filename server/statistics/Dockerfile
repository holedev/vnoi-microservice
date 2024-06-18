FROM node:18-alpine

WORKDIR /app

COPY server/*.json .

RUN rm SERVICE.json
RUN mv SERVICE.docker.json SERVICE.json

WORKDIR /app/protos

COPY server/protos/ .

WORKDIR /app/statistics

COPY server/statistics/package.json .

COPY server/statistics/ .

RUN npm install

EXPOSE 9006

CMD ["npm", "run", "dev"]