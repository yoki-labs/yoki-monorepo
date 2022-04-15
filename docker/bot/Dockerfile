FROM node:16-alpine
WORKDIR /opt/build

RUN apk add --update \
	&& apk add --no-cache ca-certificates \
	&& apk add --no-cache --virtual .build-deps curl bash jq \
	&& curl -L https://yarnpkg.com/install.sh | bash

COPY tsconfig.json ./
WORKDIR /opt/build/services/bot

COPY ./services/bot/package.json ./
RUN yarn install

COPY ./services/bot/prisma/. ./prisma/
RUN yarn generate

COPY ./services/bot/tsconfig.json ./services/bot/nodemon.json ./
COPY ./services/bot/src/. ./src/
RUN yarn build

RUN yarn remove $(cat package.json | jq -r '.devDependencies | keys | join(" ")')

FROM node:16-alpine
WORKDIR /usr/app

COPY --from=0 ./opt/build/tsconfig.json .
COPY --from=0 ./opt/build/services/bot/ services/bot/

WORKDIR /usr/app/services/bot
CMD ["yarn", "run", "start"]