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
WORKDIR /opt/build/services/tuxedo

COPY ./services/tuxedo/package.json ./
RUN yarn install

COPY ./services/tuxedo/prisma/. ./prisma/
RUN yarn generate

COPY ./services/tuxedo/tsconfig.json ./services/tuxedo/nodemon.json ./
COPY ./services/tuxedo/src/. ./src/
RUN yarn build

RUN if [[ "$BUILD_ENV" = "development" ]]; then yarn remove $(cat package.json | jq -r '.devDependencies | keys | join(" ")'); fi
FROM node:16-alpine
WORKDIR /usr/app

RUN apk update \
	&& apk add cairo-dev

COPY --from=0 ./opt/build/tsconfig.json .
COPY --from=0 ./opt/build/services/tuxedo/ services/tuxedo/

WORKDIR /usr/app/services/tuxedo
CMD ["yarn", "run", "start"]