import { RewriteFrames } from "@sentry/integrations";
import * as Sentry from "@sentry/node";

Sentry.init({
    dsn: process.env.SENTRY_KEY,
    tracesSampleRate: 1.0,
    integrations: [
        new RewriteFrames({
            root: global.__dirname,
        }),
    ],
    environment: process.env.NODE_ENV === "production" ? "production" : "development",
});
