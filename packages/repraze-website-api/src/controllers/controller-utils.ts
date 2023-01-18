import {AnyObject, UpdateQuery} from "mongoose";

export function filterEmpties<T>(objects: (T | undefined | null)[]): T[] {
    const filtered: T[] = [];
    for (const object of objects) {
        if (object) {
            filtered.push(object);
        }
    }
    return filtered;
}

export function makeUpdateRecord<T extends AnyObject>(newRecord: Partial<T>): UpdateQuery<T> {
    const update: UpdateQuery<T> = {
        $set: {},
        $unset: {},
    };

    for (const [key, value] of Object.entries(newRecord) as [keyof T, any][]) {
        if (update.$unset && value === undefined) {
            update.$unset[key] = "" as any;
        } else if (update.$set) {
            update.$set[key] = value;
        }
    }

    return update;
}
