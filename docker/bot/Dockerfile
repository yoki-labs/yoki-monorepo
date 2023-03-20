FROM node:16-alpine
WORKDIR /opt/build
ENV BUILD_ENV=production

RUN apk update \
	&& apk add --no-cache --virtual .build-deps build-base \
	libpng \
	libpng-dev \
	jpeg-dev \
	pango-dev \
	curl \
	bash \ 
	jq \
	&& curl -L https://yarnpkg.com/install.sh | bash 

COPY tsconfig.json ./

WORKDIR /opt/build/yoki
COPY ./yoki/prisma/. ./prisma/

WORKDIR /opt/build/yoki/bot

COPY ./yoki/bot/package.json ./
RUN yarn install
RUN yarn generate

COPY ./yoki/bot/tsconfig.json ./yoki/bot/nodemon.json ./
COPY ./yoki/bot/src/. ./src/
RUN yarn build

RUN if [[ "$BUILD_ENV" = "development" ]]; then yarn remove $(cat package.json | jq -r '.devDependencies | keys | join(" ")'); fi
FROM node:16-alpine
WORKDIR /usr/app

RUN apk update \
	&& apk add cairo-dev pango-dev jpeg-dev

COPY --from=0 ./opt/build/tsconfig.json .
COPY --from=0 ./opt/build/yoki/bot/ yoki/bot/

WORKDIR /usr/app/yoki/bot
CMD ["yarn", "run", "start"]