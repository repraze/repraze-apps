import {createContext} from "react";

import {Api} from "./api";

export const ApiContext = createContext<Api>({
    // authentication
    authenticate() {
        throw new Error("Unimplemented authenticate method");
    },
    unauthenticate() {
        throw new Error("Unimplemented unauthenticate method");
    },
    isAuthenticating: false,
    isAuthenticated: false,
    // fetcher
    fetch() {
        throw new Error("Unimplemented fetch method");
    },
    get() {
        throw new Error("Unimplemented get method");
    },
    post() {
        throw new Error("Unimplemented post method");
    },
    put() {
        throw new Error("Unimplemented put method");
    },
    patch() {
        throw new Error("Unimplemented patch method");
    },
    delete() {
        throw new Error("Unimplemented delete method");
    },
});
