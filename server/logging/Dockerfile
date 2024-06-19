FROM node:18-alpine

WORKDIR /app

RUN chown -R node:node /app

USER node

COPY --chown=node:node ./*.json ./

RUN rm SERVICE.json \
    && mv SERVICE.docker.json SERVICE.json

WORKDIR /app/logging

COPY --chown=node:node ./logging/ ./

RUN npm install --omit=dev && npm cache clean --force

EXPOSE 9007

CMD ["npm", "run", "prod"]