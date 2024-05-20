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
COPY pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json package.json turbo.json .swcrc ./
COPY ./packages ./packages
COPY ./yoki/common ./yoki/common

RUN pnpm install --silent
RUN pnpm run build:deps

# root /yoki/bot
WORKDIR /opt/build/yoki/bot

COPY ./yoki/bot/package.json ./
# for workspaces
RUN pnpm install --silent

# root /yoki/bot/prisma/ for DB stuff
COPY ./yoki/bot/prisma/. ./prisma/
RUN npx prisma generate

COPY ./yoki/bot/tsconfig.json ./yoki/bot/nodemon.json ./
COPY ./yoki/bot/src/. ./src/
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
COPY --from=0 ./opt/build/yoki/common/ yoki/common/
COPY --from=0 ./opt/build/yoki/bot/ yoki/bot/

WORKDIR /usr/app/yoki/bot
CMD ["npm", "run", "start"]