import {createContext} from "react";

// import {ApiInterface, ApiUnimplemented} from "./api";

// export const ApiContext = createContext<ApiInterface>(new ApiUnimplemented());

export const ApiContext = createContext({
    // authentication
    authenticate(token: string): void {
        throw new Error("Unimplemented authenticate method");
    },
    unauthenticate(): void {
        throw new Error("Unimplemented unauthenticate method");
    },
    isAuthenticating: false,
    isAuthenticated: false,
    // requests
    fetch(endpoint: RequestInfo, init?: RequestInit): Promise<any> {
        throw new Error("Unimplemented fetch method");
    },
    get(endpoint: RequestInfo, init?: RequestInit): Promise<any> {
        throw new Error("Unimplemented get method");
    },
    post(endpoint: RequestInfo, body: any, init?: RequestInit): Promise<any> {
        throw new Error("Unimplemented post method");
    },
    put(endpoint: RequestInfo, body: any, init?: RequestInit): Promise<any> {
        throw new Error("Unimplemented put method");
    },
    patch(endpoint: RequestInfo, body: any, init?: RequestInit): Promise<any> {
        throw new Error("Unimplemented patch method");
    },
    delete(endpoint: RequestInfo, init?: RequestInit): Promise<any> {
        throw new Error("Unimplemented delete method");
    },
});
