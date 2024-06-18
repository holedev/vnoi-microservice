FROM node:18-alpine

WORKDIR /app

COPY server/*.json .

RUN rm SERVICE.json
RUN mv SERVICE.docker.json SERVICE.json

WORKDIR /app/protos

COPY server/protos/ .

WORKDIR /app/common

COPY server/common/package.json .

COPY server/common/ .

RUN npm install

EXPOSE 9001

CMD ["npm", "run", "dev"]