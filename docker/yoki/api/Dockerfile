FROM node:16-alpine
WORKDIR /opt/build

RUN corepack enable && corepack prepare pnpm@7.18.0 --activate

# # Package stuff
WORKDIR /opt/build/yoki/api

COPY ./yoki/api/package.json ./
RUN pnpm install --silent

# Copy over sources and build them
COPY ./yoki/api/tsconfig.json ./yoki/api/nodemon.json ./yoki/api/schema.prisma ./
COPY ./yoki/bot/prisma/schema.prisma base.prisma
RUN pnpm generate:prod

COPY ./yoki/api/src/. ./src/
RUN pnpm build

# RUN if [[ "$BUILD_ENV" = "production" ]]; then pnpm prune --prod; fi

FROM node:16-alpine
WORKDIR /usr/app

COPY --from=0 ./opt/build/yoki/api/ ./yoki/api/

WORKDIR /usr/app/yoki/api
CMD ["npm", "run", "start"]