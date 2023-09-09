import { toast } from "react-hot-toast";

export async function notifyFetchError(message: string, errorResponse: Response) {
    const error = await errorResponse.json();

    console.log(message, error);

    toast.error(error.message);
}