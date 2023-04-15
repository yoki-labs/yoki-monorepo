export function req<T = any>(
    url: string,
    access_token: string,
    options: Partial<RequestInit> & { method: "get" | "post" | "put" | "delete" },
    body?: Record<string, any>
): Promise<T> {
    const request: any = {
        headers: {},
        body: body ? JSON.stringify(body) : undefined,
        credentials: "include",
        ...options, // Provieds users a way to override everything
    };
    request.headers["Authorization"] = `Bearer ${access_token}`;

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
    post: (url: string, body: Record<string, any>) => req(url, token, { method: "post" }, body),
    delete: (url: string) => req(url, token, { method: "delete" }),
    put: (url: string, body: Record<string, any>) => req(url, token, { method: "put" }, body),
});
