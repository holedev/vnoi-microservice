FROM node:18-alpine

WORKDIR /app

COPY server/*.json .

RUN rm SERVICE.json
RUN mv SERVICE.docker.json SERVICE.json

WORKDIR /app/protos

COPY server/protos/ .

WORKDIR /app/exercise

COPY server/exercise/package.json .

COPY server/exercise/ .

RUN npm install

EXPOSE 9003

CMD ["npm", "run", "dev"]