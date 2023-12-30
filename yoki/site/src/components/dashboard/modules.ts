import { SanitizedServer } from "../../lib/@types/db";
import { errorifyResponseError, notifyFetchError } from "../../utils/errorUtil";

export const toggleModule = (serverId: string, propType: keyof SanitizedServer, value: boolean) =>
    fetch(`/api/servers/${serverId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ [propType]: value }),
    })
        .then(errorifyResponseError)
        .catch(notifyFetchError.bind(null, "Error while toggling module"));
