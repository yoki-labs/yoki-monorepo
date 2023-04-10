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
# root /
COPY tsconfig.json ./
COPY .eslintrc.json ./
COPY package.json ./

COPY ./yokilabs ./yokilabs

# root /yoki/bot
WORKDIR /opt/build/yoki/bot

COPY ./yoki/bot/package.json ./
COPY ./yoki/.env ../

# for workspaces
RUN yarn install

# root /yoki/bot/prisma/ for DB stuff
COPY ./yoki/bot/prisma/. ./prisma/
RUN yarn generate

# Install packages
WORKDIR /opt/build/
RUN yarn

WORKDIR /opt/build/yoki/bot

COPY ./yoki/bot/tsconfig.json ./yoki/bot/nodemon.json ./
COPY ./yoki/bot/src/. ./src/
RUN yarn build

RUN if [[ "$BUILD_ENV" = "development" ]]; then yarn remove $(cat package.json | jq -r '.devDependencies | keys | join(" ")'); fi
FROM node:16-alpine

# Copy over to and install stuff in /usr/app to run the bot
WORKDIR /usr/app

RUN apk update \
	&& apk add cairo-dev pango-dev jpeg-dev

COPY --from=0 ./opt/build/tsconfig.json .
COPY --from=0 ./opt/build/package.json .
COPY --from=0 ./opt/build/node_modules node_modules
COPY --from=0 ./opt/build/yoki/bot/ yoki/bot/
COPY --from=0 ./opt/build/yokilabs/ yokilabs/


WORKDIR /usr/app/yoki/bot
CMD ["yarn", "run", "start"]