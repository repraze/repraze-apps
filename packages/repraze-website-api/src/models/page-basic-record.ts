import {PageBasic} from "@repraze/website-lib/types/page-basics";

import {MediaBasicRecord} from "./media-basic-record";
import {RecordId} from "./record";

export interface PageBasicRecord extends Omit<PageBasic, "featured_media_id" | "featured_media"> {
    _id?: RecordId;
    // fields
    featured_media?: RecordId | MediaBasicRecord; // ref
    // visibility
    // no change
}
