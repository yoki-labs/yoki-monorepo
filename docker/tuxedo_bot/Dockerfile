FROM node:16-alpine
WORKDIR /opt/build
ENV BUILD_ENV=production

RUN apk update \
	&& apk add --no-cache --virtual .build-deps build-base \
	curl \
	bash \
	jq \
	&& curl -L https://yarnpkg.com/install.sh | bash

COPY tsconfig.json ./
COPY .eslintrc.json ./
COPY package.json ./

# ./yokilabs in /opt/build/yokilabs
COPY ./yokilabs ./yokilabs

# Doesn't fix
# WORKDIR /opt/build/yokilabs/util

# RUN yarn
# RUN yarn build

# WORKDIR /opt/build/yokilabs/bot

# RUN yarn
# RUN yarn build

# Tuxedo stuff
WORKDIR /opt/build/tuxedo/bot

COPY ./tuxedo/bot/package.json ./

RUN yarn install

COPY ./tuxedo/bot/prisma/. ./prisma/
RUN yarn generate

COPY ./tuxedo/bot/tsconfig.json ./tuxedo/bot/nodemon.json ./
COPY ./tuxedo/bot/src/. ./src/
RUN yarn build

RUN if [[ "$BUILD_ENV" = "development" ]]; then yarn remove $(cat package.json | jq -r '.devDependencies | keys | join(" ")'); fi
FROM node:16-alpine
WORKDIR /usr/app

RUN apk update \
	&& apk add cairo-dev

COPY --from=0 ./opt/build/tsconfig.json .
COPY --from=0 ./opt/build/tuxedo/bot/ tuxedo/bot/

WORKDIR /usr/app/tuxedo/bot
CMD ["yarn", "run", "start"]