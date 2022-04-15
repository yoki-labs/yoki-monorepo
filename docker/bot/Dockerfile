FROM node:16-alpine
WORKDIR /opt/build

RUN apk add --update \
	&& apk add --no-cache ca-certificates \
	&& apk add --no-cache --virtual .build-deps curl bash jq \
	&& curl -L https://yarnpkg.com/install.sh | bash

RUN chown node /opt/build
COPY --chown=node tsconfig.json ./

WORKDIR /opt/build/services/bot

COPY --chown=node ./services/bot/package.json ./
RUN yarn install

USER node
COPY --chown=node ./services/bot/prisma/. ./prisma/
RUN yarn generate

COPY --chown=node  ./services/bot/tsconfig.json ./
COPY --chown=node ./services/bot/src/. ./src/
RUN yarn build

RUN yarn remove $(cat package.json | jq -r '.devDependencies | keys | join(" ")')

FROM node:16-alpine
WORKDIR /usr/app

COPY --from=0 ./opt/build/tsconfig.json .
COPY --from=0 ./opt/build/services/bot/ services/bot/

WORKDIR /usr/app/services/bot
COPY --chown=node  ./services/bot/nodemon.json ./
CMD ["yarn", "run", "start"]