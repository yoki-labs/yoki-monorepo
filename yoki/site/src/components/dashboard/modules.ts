import { toast } from "react-hot-toast";
import { SanitizedServer } from "../../lib/@types/db";

export async function toggleModule(serverId: string, propType: keyof SanitizedServer, value: boolean) {
    return fetch(`/api/servers/${serverId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ [propType]: value }),
    })
        .catch(async (errorResponse) =>
            onError(errorResponse)
        );
}

async function onError(errorResponse: Response) {
    const error = await errorResponse.json();

    console.log("Error while toggling module:", error);

    toast.error(error.message);
}