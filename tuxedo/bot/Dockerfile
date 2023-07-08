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
	&& corepack enable && corepack prepare pnpm@7.18.0 --activate

# root /
COPY pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json turbo.json .swcrc package.json ./
COPY ./packages ./packages

RUN pnpm install --silent
RUN pnpm run build:deps

# root /tuxedo/bot
WORKDIR /opt/build/tuxedo/bot

COPY ./tuxedo/bot/package.json ./
# for workspaces
RUN pnpm install --silent

# root /tuxedo/bot/prisma/ for DB stuff
COPY ./tuxedo/bot/prisma/. ./prisma/
RUN npx prisma generate

COPY ./tuxedo/bot/tsconfig.json ./tuxedo/bot/nodemon.json ./
COPY ./tuxedo/bot/src/. ./src/
RUN pnpm run build

# RUN if [[ "$BUILD_ENV" = "production" ]]; then pnpm prune --prod; fi
FROM node:16-alpine

# Copy over to and install stuff in /usr/app to run the bot
WORKDIR /usr/app

RUN apk update \
	&& apk add cairo-dev pango-dev jpeg-dev

COPY --from=0 ./opt/build/tsconfig.json ./opt/build/package.json ./
COPY --from=0 ./opt/build/node_modules node_modules
COPY --from=0 ./opt/build/packages/ packages/
COPY --from=0 ./opt/build/tuxedo/bot/ tuxedo/bot/

WORKDIR /usr/app/tuxedo/bot
CMD ["npm", "run", "start"]