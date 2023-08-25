import { SanitizedServer } from "../../lib/@types/db";

export async function toggleModule(serverId: string, propType: keyof SanitizedServer, value: boolean) {
    return fetch(`/api/servers/${serverId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ [propType]: value }),
    })
}