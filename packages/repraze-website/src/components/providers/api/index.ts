import {User} from "@repraze/website-lib/types/user";
import {useContext, useEffect, useState} from "react";

import {ApiContext} from "./api-context";

export {ApiProvider} from "./api-provider";
export {ApiContext} from "./api-context";

export function useApi() {
    const api = useContext(ApiContext);
    return api;
}
