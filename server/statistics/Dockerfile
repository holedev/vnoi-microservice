FROM node:18-alpine

WORKDIR /app

RUN chown -R node:node /app

USER node

COPY --chown=node:node ./*.json ./

RUN rm SERVICE.json \
    && mv SERVICE.docker.json SERVICE.json

WORKDIR /app/protos

COPY --chown=node:node ./protos/ ./

WORKDIR /app/statistics

COPY --chown=node:node ./statistics/ ./

RUN npm install --omit=dev && npm cache clean --force

EXPOSE 9006

CMD ["npm", "run", "prod"]