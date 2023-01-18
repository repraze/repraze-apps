import {ObjectId, isValidObjectId} from "mongoose";

export type RecordId = ObjectId | string;

export function isValidRecordId(value: any): value is RecordId {
    if (typeof value === "string" || typeof value === "object") {
        return isValidObjectId(value);
    }
    return false;
}
