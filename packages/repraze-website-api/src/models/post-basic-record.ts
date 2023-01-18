import {DocumentId} from "@repraze/website-lib/types/document";
import {PostBasic} from "@repraze/website-lib/types/post-basic";

import {MediaBasicRecord} from "./media-basic-record";
import {RecordId} from "./record";
import {UserBasicRecord} from "./user-basic-record";

export interface PostBasicRecord
    extends Omit<PostBasic, "author_user_ids" | "author_users" | "featured_media_id" | "featured_media"> {
    _id?: RecordId;
    // fields
    id: DocumentId; // no longer optional for saved records
    author_users: (RecordId | UserBasicRecord)[]; // refs, no longer optional for saved records
    featured_media?: RecordId | MediaBasicRecord; // ref
    // visibility
    // no change
}
