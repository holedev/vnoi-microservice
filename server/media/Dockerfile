FROM alpine:latest AS ffmpeg-stage
RUN apk --no-cache add ffmpeg

FROM node:18-alpine

COPY --from=ffmpeg-stage / /

WORKDIR /app

RUN addgroup -g 1000 node \
    && adduser -u 1000 -G node -s /bin/sh -D node

RUN apk update && apk add bash

RUN chown -R node:node /app

USER node

COPY --chown=node:node ./*.json ./

RUN rm SERVICE.json \
    && mv SERVICE.docker.json SERVICE.json

WORKDIR /app/protos

COPY --chown=node:node ./protos/ ./

WORKDIR /app/media

COPY --chown=node:node ./media/ ./

RUN mkdir -p uploads/files/ uploads/videos/ uploads/images/ \
    && chown -R node:node /app/media/

RUN npm install --omit=dev && npm cache clean --force

EXPOSE 9004

CMD ["npm", "run", "prod"]