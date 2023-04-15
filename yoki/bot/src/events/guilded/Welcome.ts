import type { GEvent } from "../../typings";

export default {
    execute: ([client]) => {
        // parsing the env variable of operators (string1,string2,string3) and setting to array
        client.operators = process.env.OPERATOR_IDS?.split(",") ?? [];

        console.log(`Logged in as ${client.user!.name}`);
    },
    name: "ready",
} satisfies GEvent<"ready">;
