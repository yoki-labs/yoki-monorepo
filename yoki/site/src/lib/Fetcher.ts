export function req<T = Record<string, string>>(
    url: string,
    access_token: string,
    options: Partial<RequestInit> & { method: "get" | "post" | "put" | "delete" },
    body?: Record<string, string | number | boolean>
): Promise<T> {
    const request: RequestInit = {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
        credentials: "include",
        ...options, // Provides users a way to override everything
    };

    return fetch(url, request)
        .then((x) => x.json() as Promise<T>)
        .catch(async (x) => {
            console.error(x);
            console.log(await x.text());
            throw x;
        });
}

export const methods = (token: string) => ({
    get: <T = Record<string, string>>(url: string) => req<T>(url, token, { method: "get" }),
    post: <T = Record<string, string>>(url: string, body: Record<string, string | number | boolean>) => req<T>(url, token, { method: "post" }, body),
    delete: <T = Record<string, string>>(url: string) => req<T>(url, token, { method: "delete" }),
    put: <T = Record<string, string>>(url: string, body: Record<string, string | number | boolean>) => req<T>(url, token, { method: "put" }, body),
});
