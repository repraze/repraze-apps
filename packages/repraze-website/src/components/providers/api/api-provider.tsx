import React, {useCallback, useEffect, useMemo, useState} from "react";

import {ApiError, makeApiFetcher} from "./api";
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

    // fetcher
    const fetcher = useMemo(() => makeApiFetcher(base, {authorization: auth}), [base, auth]);

    useEffect(() => {
        async function initAuth() {
            if (loading) {
                try {
                    // TODO: refresh token, authenticateHandler?
                    const auth = getAuthFromStorage();
                    if (auth) {
                        await fetcher.get("user", {headers: {Authorization: `Bearer ${auth}`}});
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
    }, [loading, setLoading, setAuth, fetcher]);

    return (
        <ApiContext.Provider
            value={{
                // authentication
                authenticate: authenticateHandler,
                unauthenticate: unauthenticateHandler,
                isAuthenticating: loading,
                isAuthenticated: auth !== undefined,
                // fetcher
                ...fetcher,
            }}
        >
            {children}
        </ApiContext.Provider>
    );
}
