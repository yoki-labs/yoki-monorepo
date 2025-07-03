> ⚠️ This is an archive of the Yoki & Tuxo source code. Yoki shut down in July of 2024 due to disagreements in Guilded's policy. The Guilded API has changed significantly since then, so it's likely that trying to run the bot in its current state would not work.

# Yoki

An automod bot that helps assist communities to protect their servers.

## Getting Started

### Setting up your dev environment

There are two docker-compose files included, one for the development environment, which starts up a Postgres server, and the other for production which builds the bot/nsfw image.

### Requirements

-   [Node v16.0.0+](https://nodejs.org/en/)
-   [PNPM](https://pnpm.io/)
-   [Docker](https://www.docker.com/) ([install](https://docs.docker.com/get-docker/)) and [Docker-Compose](https://docs.docker.com/compose/) ([install](https://docs.docker.com/compose/install/))

## Starting the bot

**A video demonstration of the below steps is available [here](https://github.com/yoki-labs/bots/issues/1)**

-   Clone the repository `git clone https://github.com/yoki-labs/bots.git`
-   Cd in and install the packages `cd yoki && pnpm install`
-   Generate the Prisma typings `pnpm generate`
-   Populate the [environment variables in a .env file in the root](#environment-variables)
-   Start the database `pnpm yoki:db`
-   Run the migrations `pnpm yoki:migrate`
-   And finally, start the bot. In the bot dir, run `pnpm dev`

## Environment Variables

```
MAIN_SERVER="MAIN_SERVER_ID_TO_TEST_IN"
ERROR_WEBHOOK="ERROR_WEBHOOK_URL"
GUILDED_TOKEN="GET_GUILDED_TOKEN_FROM_SOMEWHERE"
DATABASE_URL="PUT_IN_TEST_DB_URL" // if you are using the docker-compose setup, your url will be exactly this "postgresql://yoki_user:yoki_pass@localhost:5432/yoki?schema=public".
DEFAULT_PREFIX="DEFAULT_PREFIX"
NODE_ENV="development"
```

## Standards

Please make sure you run `pnpm build` and `pnpm lint:fix` before pushing commits to your branch. The husky git commit hook should do it for you, but if it doesn't, be sure to do it yourself.

## Terms

This repository is public purely as a view-only showcase. You are not permitted to fork or run your own instance of the bot without prior permission.
