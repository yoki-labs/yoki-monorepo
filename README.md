# Yoki (PRIVATE)

An automod/moderation bot that helps assist communities to protect their servers.

## Getting Started

### Setting up your dev environment

You have two options for setting up Yoki. One is using node.js/NPM directly, and the other is using the provided docker-compose files. There is better stability and mirroring of the prod environment by using the docker-compose files. There are two docker-compose files included, one for the development environment, which starts up a Postgres server and mounts the source code as a volume in the container for fast hot code reloading, and the other for production which just builds the bot image.

That was a lot of jargon, I admit. To simplify it a lot: development in the docker-compose environment is exactly how it's gonna be in prod. So that way, we never have to worry about the VPS itself being a problem, and that we can deploy on almost any system that supports docker. For simplicity sake, I'm going to assume you are all going to use the docker-compose environment.

### Requirements

-   [Node v16.0.0+](https://nodejs.org/en/)
-   [Yarn v1.22.17](https://classic.yarnpkg.com/en/)
-   [Docker](https://www.docker.com/) ([install](https://docs.docker.com/get-docker/)) and [Docker-Compose](https://docs.docker.com/compose/) ([install](https://docs.docker.com/compose/install/))

## Starting the bot

**A video demonstration of the below steps is available [here](https://github.com/Yoki-Labs/yoki/issues/1)**

-   Clone the repository `git clone https://github.com/Yoki-Labs/yoki.git`
-   Cd in and install the packages `cd yoki && yarn install`
-   Populate the [environment variables in a .env file in the root](#environment-variables)
-   Start the database `./run.sh db`
-   Run the migrations `cd services/bot && yarn migrate:dev`
-   And finally, start the bot. In the root, run `./run.sh` (you can stop everything using `./run.sh down` (add the -v flag to the end if you want to wipe the database))

## Environment Variables

```
MAIN_SERVER="MAIN_SERVER_TO_TEST_IN"
ERROR_WEBHOOK="ERROR_WEBHOOK_URL"
GUILDED_TOKEN="GET_GUILDED_TOKEN_FROM_SOMEWHERE"
DATABASE_URL="PUT_IN_TEST_DB_URL" // if you are using the docker-compose setup, your url will be exactly this "postgresql://yoki_user:yoki_pass@localhost:5432/yoki?schema=public".
DEFAULT_PREFIX="DEFAULT_PREFIX"
```

## Standards

**Once we have a stable prod, never commit straight to main! Always use a feature branch and create PRs!**.
Please make sure you run `yarn build` and `yarn lint:fix` before pushing commits to your branch. The husky git commit hook should do it for you, but if it doesn't, be sure to do it yourself.

## Terms

By coming on as a developer, you are expected to keep this code closed source. You are not to fork it or republish it, as this code is unlicensed and any unauthorized distribution will be a violation of the licensing (or rather, the lack of). Of course, I'm probably not gonna litigate anything, but it's in your better favor not to be a jerk to the people who have put a lot of hard work into this bot.
