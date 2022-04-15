FROM node:16-alpine
WORKDIR /opt/build

RUN apk add --update \
	&& apk add --no-cache ca-certificates \
	&& apk add --no-cache --virtual .build-deps curl bash jq

RUN curl -L https://yarnpkg.com/install.sh | bash
RUN chown node /opt/build

COPY --chown=node tsconfig.json ./
COPY --chown=node  ./services/bot/package.json ./services/bot/tsconfig.json ./services/bot/nodemon.json services/bot/

USER node
COPY --chown=node ./services/bot/prisma/. services/bot/prisma/
COPY --chown=node ./services/bot/src/. services/bot/src/

WORKDIR /opt/build/services/bot
RUN yarn install
RUN yarn generate
RUN yarn build
RUN yarn remove $(cat package.json | jq -r '.devDependencies | keys | join(" ")')

FROM node:16-alpine
WORKDIR /usr/app

COPY --from=0 ./opt/build/tsconfig.json .
COPY --from=0 ./opt/build/services/bot/ services/bot/

WORKDIR /usr/app/services/bot
CMD ["yarn", "run", "start"]