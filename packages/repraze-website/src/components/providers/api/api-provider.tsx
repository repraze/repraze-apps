import React, {useCallback, useEffect, useState} from "react";

import {ApiError} from "./api";
import {ApiContext} from "./api-context";

const AUTH_STORAGE_KEY = "auth";

function getAuthFromStorage(): string | undefined {
    // TODO: figure out how to keep JWT
    return window.localStorage ? window.localStorage.getItem(AUTH_STORAGE_KEY) || undefined : undefined;
}

function setAuthFromStorage(auth: string | undefined): void {
    // TODO: figure out how to keep JWT
    if (window.localStorage) {
        if (auth === undefined) {
            window.localStorage.removeItem(AUTH_STORAGE_KEY);
        } else {
            window.localStorage.setItem(AUTH_STORAGE_KEY, auth);
        }
    }
}

export interface ApiProviderProps {
    children?: React.ReactNode;
    base: string;
    clientId: string;
}

export function ApiProvider({children, base, clientId}: ApiProviderProps) {
    const [loading, setLoading] = useState<boolean>(true);
    const [auth, setAuth] = useState<string | undefined>(undefined);

    // authentication
    const authenticateHandler = useCallback((token: string) => {
        setAuthFromStorage(token);
        setAuth(token);
    }, []);
    const unauthenticateHandler = useCallback(() => {
        setAuthFromStorage(undefined);
        setAuth(undefined);
    }, []);
    // const getToken = useCallback(() => {
    //     return auth;
    // }, [auth]);

    // requests
    const fetchHandler = useCallback(
        async (endpoint: RequestInfo, init?: RequestInit): Promise<any> => {
            const url = `${base}${endpoint}`;

            const finalInit: RequestInit = {
                mode: "cors",
                redirect: "follow",
                ...init,
                headers: {
                    ...(auth !== undefined ? {Authorization: `Bearer ${auth}`} : undefined),
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
        },
        [base, auth]
    );
    // get - read
    const getHandler = useCallback(
        async (endpoint: RequestInfo, init?: RequestInit): Promise<any> => {
            return fetchHandler(endpoint, {
                ...init,
                method: "GET",
                headers: {"Content-Type": "application/json", ...init?.headers},
            });
        },
        [fetchHandler]
    );
    // post - insert
    const postHandler = useCallback(
        async (endpoint: RequestInfo, body: any, init?: RequestInit): Promise<any> => {
            return fetchHandler(endpoint, {
                ...init,
                method: "POST",
                body: JSON.stringify(body),
                headers: {"Content-Type": "application/json", ...init?.headers},
            });
        },
        [fetchHandler]
    );
    // put - upsert
    const putHandler = useCallback(
        async (endpoint: RequestInfo, body: any, init?: RequestInit): Promise<any> => {
            return fetchHandler(endpoint, {
                ...init,
                method: "PUT",
                body: JSON.stringify(body),
                headers: {"Content-Type": "application/json", ...init?.headers},
            });
        },
        [fetchHandler]
    );
    // patch - update
    const patchHandler = useCallback(
        async (endpoint: RequestInfo, body: any, init?: RequestInit): Promise<any> => {
            return fetchHandler(endpoint, {
                ...init,
                method: "PATCH",
                body: JSON.stringify(body),
                headers: {"Content-Type": "application/json", ...init?.headers},
            });
        },
        [fetchHandler]
    );
    // delete - remove
    const deleteHandler = useCallback(
        async (endpoint: RequestInfo, init?: RequestInit): Promise<any> => {
            return fetchHandler(endpoint, {
                ...init,
                method: "DELETE",
                headers: {"Content-Type": "application/json", ...init?.headers},
            });
        },
        [fetchHandler]
    );

    useEffect(() => {
        async function initAuth() {
            if (loading) {
                try {
                    // TODO: refresh token, authenticateHandler?
                    const auth = getAuthFromStorage();
                    if (auth) {
                        await getHandler("user", {headers: {Authorization: `Bearer ${auth}`}});
                        setAuth(auth);
                    }
                } catch (error) {
                    console.error(error);
                    setAuthFromStorage(undefined);
                }
                setLoading(false);
            }
        }
        initAuth();
        return () => {};
    }, [loading, setLoading, setAuth, getHandler]);

    return (
        <ApiContext.Provider
            value={{
                // authentication
                authenticate: authenticateHandler,
                unauthenticate: unauthenticateHandler,
                isAuthenticating: loading,
                isAuthenticated: auth !== undefined,
                // requests
                fetch: fetchHandler,
                get: getHandler,
                post: postHandler,
                put: putHandler,
                patch: patchHandler,
                delete: deleteHandler,
            }}
        >
            {children}
        </ApiContext.Provider>
    );
}
