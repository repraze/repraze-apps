import {useContext, useEffect, useState} from "react";

import {User} from "../../../repraze-types/user";
import {ApiContext} from "./api-context";

export {ApiProvider} from "./api-provider";
export {ApiContext} from "./api-context";

export function useApi() {
    const api = useContext(ApiContext);
    return api;
}

export function useCurrentUser() {
    const api = useApi();
    const [currentUser, setCurrentUser] = useState<User>();

    useEffect(() => {
        async function fetchCurrentUser() {
            const response = await api.get("user");
            const currentUser = response.data;

            setCurrentUser(currentUser);
        }
        fetchCurrentUser();
    }, []);

    return currentUser;
}
