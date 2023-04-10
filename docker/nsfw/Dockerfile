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

# root /
COPY tsconfig.json ./
COPY .eslintrc.json ./
COPY package.json ./

# # Package stuff
WORKDIR /opt/build/yoki/nsfw

COPY ./yoki/nsfw/package.json ./
# COPY ./yoki/nsfw/package.json ./yoki/nsfw
# RUN yarn install
WORKDIR /opt/build/
RUN yarn

WORKDIR /opt/build/yoki/nsfw

# Copy over sources and build them
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
COPY --from=0 ./opt/build/.eslintrc.json .
COPY --from=0 ./opt/build/package.json .
COPY --from=0 ./opt/build/yoki/nsfw/ ./yoki/nsfw/

WORKDIR /usr/app/yoki/nsfw
CMD ["yarn", "run", "start"]