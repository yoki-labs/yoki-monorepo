# Yoki (PRIVATE)

An automod/moderation bot that helps assist communities to protect their servers.

## Getting Started

### Setting up your dev environment

You have two options for setting up Yoki. One is using node.js/NPM directly, and the other is using the provided docker-compose files. There is better stability and mirroring of the prod environment by using the docker-compose files. There are two docker-compose files included, one for the development environment, which starts up a Postgres server and mounts the source code as a volume in the container for fast hot code reloading, and the other for production which just builds the bot image.

### Requirements

-   [Node v16.0.0+](https://nodejs.org/en/)
-   [Yarn v1.22.17](https://classic.yarnpkg.com/en/)
-   [Docker](https://www.docker.com/) and [Docker-Compose](https://docs.docker.com/compose/)

### Installation

#### NodeJS

```
git clone https://github.com/yoki-labs/yoki.git
cd yoki
yarn install
yarn build
nano .env // this is where you put your env secrets
cd services/bot
yarn start
```

#### Docker-Compose

```
git clone https://github.com/yoki-labs/yoki.git
cd yoki
yarn install
./run.sh
```

## Environment Variables

```
GUILDED_TOKEN="GET_GUILDED_TOKEN_FROM_SOMEWHERE"
DATABASE_URL="PUT_IN_TEST_DB_URL" // if you are using the docker-compose setup, your url will look a little different.
DEFAULT_PREFIX="DEFAULT_PREFIX"
```

## Standards

**Never commit straight to main! Always use a feature branch and create PRs!**.
Please make sure you run `yarn build` and `yarn lint:fix` before pushing commits to your branch. The husky git commit hook should do it for you, but if it doesn't, be sure to do it yourself.

## Terms

By coming on as a developer, you are expected to keep this code closed source. You are not to fork it or republish it, as this code is unlicensed and any unauthorized distribution will be a violation of the licensing (or rather, the lack of). Of course, I'm probably not gonna litigate anything, but it's in your better favor not to be a jerk to the people who have put a lot of hard work into this bot.
