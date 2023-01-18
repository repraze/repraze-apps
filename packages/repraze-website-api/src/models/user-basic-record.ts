import {UserBasic} from "@repraze/website-lib/types/user-basic";

import {MediaBasicRecord} from "./media-basic-record";
import {RecordId} from "./record";

export interface UserBasicRecord extends Omit<UserBasic, "profile_media_id" | "profile_media"> {
    _id?: RecordId;
    // fields
    profile_media?: RecordId | MediaBasicRecord; // ref
}
