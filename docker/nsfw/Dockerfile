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
WORKDIR /opt/build/services/nsfw

COPY ./services/nsfw/package.json ./
RUN yarn install

COPY ./services/nsfw/tsconfig.json ./services/nsfw/nodemon.json ./
COPY ./services/nsfw/src/. ./src/
RUN yarn build

RUN yarn remove $(cat package.json | jq -r '.devDependencies | keys | join(" ")')

FROM node:16-buster-slim
WORKDIR /usr/app

RUN apt-get update && \ 
	apt-get install -y build-essential \
	libc6-dev 

COPY --from=0 ./opt/build/tsconfig.json .
COPY --from=0 ./opt/build/services/nsfw/ services/nsfw/

WORKDIR /usr/app/services/nsfw
CMD ["yarn", "run", "start"]