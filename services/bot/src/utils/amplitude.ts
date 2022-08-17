import * as Amplitude from "@amplitude/node";

const client = Amplitude.init(process.env.AMPLITUDE_API_KEY!);
client.addEventMiddleware((payload, next) => {
    payload.event.version_name = process.env.NODE_ENV === "production" ? "production" : "development";
    payload.event.user_id = "BOT_PROCESS";
    return next(payload);
});
export default client;
