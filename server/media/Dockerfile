FROM node:18-alpine

WORKDIR /app

COPY server/*.json .

RUN rm SERVICE.json
RUN mv SERVICE.docker.json SERVICE.json

WORKDIR /app/protos

COPY server/protos/ .

WORKDIR /app/media

COPY server/media/package.json .

COPY server/media/ .

RUN npm install

EXPOSE 9004

CMD ["npm", "run", "dev"]