FROM node:18-alpine

WORKDIR /app

COPY server/*.json .

RUN rm SERVICE.json
RUN mv SERVICE.docker.json SERVICE.json

WORKDIR /app/protos

COPY server/protos/ .

WORKDIR /app/learning

COPY server/learning/package.json .

COPY server/learning/ .

RUN npm install

EXPOSE 9005

CMD ["npm", "run", "dev"]