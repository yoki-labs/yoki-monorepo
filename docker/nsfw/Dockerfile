FROM node:16-alpine
WORKDIR /opt/build

RUN apk add --update \
	&& apk add --no-cache libc6-compat gcompat ca-certificates \
	&& apk add --no-cache --virtual .build-deps curl bash jq \
	&& curl -L https://yarnpkg.com/install.sh | bash

COPY tsconfig.json ./
WORKDIR /opt/build/services/nsfw

COPY ./services/nsfw/package.json ./
RUN yarn install

COPY ./services/nsfw/tsconfig.json ./services/nsfw/nodemon.json ./
COPY ./services/nsfw/src/. ./src/
RUN yarn build

RUN yarn remove $(cat package.json | jq -r '.devDependencies | keys | join(" ")')

FROM node:16-alpine
WORKDIR /usr/app

COPY --from=0 ./opt/build/tsconfig.json .
COPY --from=0 ./opt/build/services/nsfw/ services/nsfw/

WORKDIR /usr/app/services/nsfw
CMD ["yarn", "run", "start"]