FROM node:16-buster-slim
WORKDIR /opt/build

RUN apt-get update && \ 
	apt-get install -y build-essential \
	wget \
	python3 \
	make \
	gcc \ 
	libc6-dev \
	jq

COPY tsconfig.json ./
WORKDIR /opt/build/yoki/nsfw

COPY ./yoki/nsfw/package.json ./
RUN yarn install

COPY ./yoki/nsfw/tsconfig.json ./yoki/nsfw/nodemon.json ./
COPY ./yoki/nsfw/src/. ./src/
RUN yarn build

RUN if [[ "$BUILD_ENV" = "development" ]] ; then yarn remove $(cat package.json | jq -r '.devDependencies | keys | join(" ")') ; fi

FROM node:16-buster-slim
WORKDIR /usr/app

RUN apt-get update && \ 
	apt-get install -y build-essential \
	libc6-dev 

COPY --from=0 ./opt/build/tsconfig.json .
COPY --from=0 ./opt/build/yoki/nsfw/ yoki/nsfw/

WORKDIR /usr/app/yoki/nsfw
CMD ["yarn", "run", "start"]