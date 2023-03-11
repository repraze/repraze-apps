export class ApiError extends Error {
    code: number;
    url: string;
    constructor(message: string, code = 500, url = "") {
        super(message);
        this.name = "ApiError";
        this.code = code;
        this.url = url;
    }
}

export interface ApiFetcher {
    fetch(endpoint: RequestInfo, init?: RequestInit): Promise<any>;
    get(endpoint: RequestInfo, init?: RequestInit): Promise<any>;
    post(endpoint: RequestInfo, body: any, init?: RequestInit): Promise<any>;
    put(endpoint: RequestInfo, body: any, init?: RequestInit): Promise<any>;
    patch(endpoint: RequestInfo, body: any, init?: RequestInit): Promise<any>;
    delete(endpoint: RequestInfo, init?: RequestInit): Promise<any>;
}

export interface ApiFetcherParams {
    authorization?: string;
}

export function makeApiFetcher(baseUrl: string, {authorization}: ApiFetcherParams = {}): ApiFetcher {
    // requests
    async function apiFetch(endpoint: RequestInfo, init?: RequestInit): Promise<any> {
        const url = `${baseUrl}${endpoint}`;

        const finalInit: RequestInit = {
            mode: "cors",
            redirect: "follow",
            ...init,
            headers: {
                ...(authorization !== undefined ? {Authorization: `Bearer ${authorization}`} : undefined),
                ...init?.headers,
            },
        };
        const response = await fetch(url, finalInit);
        if (response) {
            const payload = await response.json();
            if (!response.ok) {
                throw new ApiError(payload.message, response.status, url);
            }
            return payload;
        } else {
            throw new ApiError("No response", 500, url);
        }
    }
    // get - read
    async function apiGet(endpoint: RequestInfo, init?: RequestInit): Promise<any> {
        return apiFetch(endpoint, {
            ...init,
            method: "GET",
            headers: {"Content-Type": "application/json", ...init?.headers},
        });
    }
    // post - insert
    async function apiPost(endpoint: RequestInfo, body: any, init?: RequestInit): Promise<any> {
        return apiFetch(endpoint, {
            ...init,
            method: "POST",
            body: JSON.stringify(body),
            headers: {"Content-Type": "application/json", ...init?.headers},
        });
    }
    // put - upsert
    async function apiPut(endpoint: RequestInfo, body: any, init?: RequestInit): Promise<any> {
        return apiFetch(endpoint, {
            ...init,
            method: "PUT",
            body: JSON.stringify(body),
            headers: {"Content-Type": "application/json", ...init?.headers},
        });
    }
    // patch - update
    async function apiPatch(endpoint: RequestInfo, body: any, init?: RequestInit): Promise<any> {
        return apiFetch(endpoint, {
            ...init,
            method: "PATCH",
            body: JSON.stringify(body),
            headers: {"Content-Type": "application/json", ...init?.headers},
        });
    }
    // delete - remove
    async function apiDelete(endpoint: RequestInfo, init?: RequestInit): Promise<any> {
        return apiFetch(endpoint, {
            ...init,
            method: "DELETE",
            headers: {"Content-Type": "application/json", ...init?.headers},
        });
    }
    return {
        fetch: apiFetch,
        get: apiGet,
        post: apiPost,
        put: apiPut,
        patch: apiPatch,
        delete: apiDelete,
    };
}

export interface Api extends ApiFetcher {
    authenticate(token: string): void;
    unauthenticate(): void;
    isAuthenticating: boolean;
    isAuthenticated: boolean;
}
