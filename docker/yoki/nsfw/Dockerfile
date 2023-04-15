FROM node:16-buster-slim
WORKDIR /opt/build

RUN apt-get update && \ 
	apt-get install -y build-essential \
	wget \
	python3 \
	make \
	gcc \ 
	libc6-dev \
	jq \
	&& corepack enable && corepack prepare pnpm@7.18.0 --activate

# # Package stuff
WORKDIR /opt/build/yoki/nsfw

COPY ./yoki/nsfw/package.json ./
RUN pnpm install --silent

# Copy over sources and build them
COPY ./yoki/nsfw/tsconfig.json ./yoki/nsfw/nodemon.json ./
COPY ./yoki/nsfw/src/. ./src/
RUN pnpm build

# RUN if [[ "$BUILD_ENV" = "production" ]]; then pnpm prune --prod; fi

FROM node:16-buster-slim
WORKDIR /usr/app

RUN apt-get update && \ 
	apt-get install -y build-essential \
	libc6-dev 

COPY --from=0 ./opt/build/yoki/nsfw/ ./yoki/nsfw/

WORKDIR /usr/app/yoki/nsfw
CMD ["npm", "run", "start"]