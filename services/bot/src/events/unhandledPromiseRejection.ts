import { captureException } from "@sentry/node";

export default (err: Error) => {
    console.error(err);
    captureException(err);
};
