FROM node:16-alpine as BUILD_IMAGE
WORKDIR /usr/app

RUN apk add --update \
	&& apk add --no-cache ca-certificates \
	&& apk add --no-cache --virtual .build-deps curl bash

RUN curl -L https://yarnpkg.com/install.sh | bash
RUN chown node /usr/app

COPY --chown=node package.json tsconfig.json ./
COPY --chown=node ./services/bot/package.json ./services/bot/tsconfig.json ./services/bot/nodemon.json services/bot/

USER node
RUN yarn install

COPY --chown=node ./services/bot/prisma/. services/bot/prisma/
COPY --chown=node ./services/bot/src/. services/bot/src/

WORKDIR /usr/app/services/bot
RUN yarn generate
RUN yarn build
CMD ["yarn", "run", "start"]