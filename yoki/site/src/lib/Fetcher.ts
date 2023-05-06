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
    get: (url: string) => req(url, token, { method: "get" }),
    post: (url: string, body: Record<string, string | number | boolean>) => req(url, token, { method: "post" }, body),
    delete: (url: string) => req(url, token, { method: "delete" }),
    put: (url: string, body: Record<string, string | number | boolean>) => req(url, token, { method: "put" }, body),
});
