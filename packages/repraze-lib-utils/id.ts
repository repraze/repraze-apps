import {nanoid} from "nanoid";

// used for UI id gen
export function generateId(prefix?: string) {
    return (prefix ? `${prefix}-` : "") + nanoid();
}
