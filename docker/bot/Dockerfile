FROM node:16-alpine as BUILD_IMAGE
WORKDIR /usr/app

RUN apk add --update \
    && apk add --no-cache ca-certificates \
    && apk add --no-cache --virtual .build-deps curl bash

RUN curl -L https://yarnpkg.com/install.sh | bash
COPY package.json tsconfig.json ./

COPY ./services/bot/package.json ./services/bot/tsconfig.json ./services/bot/nodemon.json services/bot/
RUN yarn install
COPY ./services/bot/src/. services/bot/src/
RUN yarn build

WORKDIR /usr/app/services/bot
CMD ["yarn", "run", "start"]