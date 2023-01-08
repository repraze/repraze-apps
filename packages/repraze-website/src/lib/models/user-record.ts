import {Password} from "../types/user-basic";
import {MetaOptionalUserRecord} from "./meta-record";
import {UserBasicRecord} from "./user-basic-record";

export interface UserAndPasswordRecord {
    // hidden
    password: Password;
}

export type UserRecord = UserBasicRecord & UserAndPasswordRecord & MetaOptionalUserRecord;
