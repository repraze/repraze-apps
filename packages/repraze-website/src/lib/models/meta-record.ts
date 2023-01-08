import {Meta} from "../types/meta";
import {RecordId} from "./record";
import {UserBasicRecord} from "./user-basic-record";

export interface MetaRecord
    extends Omit<Meta, "creation_user_id" | "creation_user" | "last_edit_user_id" | "last_edit_user"> {
    creation_date: Date; // no longer optional for saved records
    creation_user: RecordId | UserBasicRecord; // ref, no longer optional for saved records
    last_edit_date: Date; // no longer optional for saved records
    last_edit_user: RecordId | UserBasicRecord; // ref, no longer optional for saved records
}

export interface MetaOptionalUserRecord
    extends Omit<Meta, "creation_user_id" | "creation_user" | "last_edit_user_id" | "last_edit_user"> {
    creation_date: Date; // no longer optional for saved records
    creation_user?: RecordId | UserBasicRecord; // ref
    last_edit_date: Date; // no longer optional for saved records
    last_edit_user?: RecordId | UserBasicRecord; // ref
}
