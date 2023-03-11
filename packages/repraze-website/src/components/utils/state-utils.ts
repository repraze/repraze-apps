import {dateISO8601String} from "@repraze/website-lib/types/document";
import {QueryClient, dehydrate} from "@tanstack/react-query";

export function serializeState(client: QueryClient) {
    return JSON.stringify(dehydrate(client));
}

export function deserializeState(state: string | undefined) {
    if (state) {
        return JSON.parse(state, (key, value) => {
            return dateISO8601String(value);
        });
    }
    return undefined;
}
