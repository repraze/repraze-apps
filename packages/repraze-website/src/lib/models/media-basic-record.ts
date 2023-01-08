import {DocumentId} from "../types/document";
import {MediaBasic, MediaCategory} from "../types/media-basic";
import {RecordId} from "./record";

export type MediaRecordDataStorageType = "record_buffer";

export interface MediaBasicRecord extends MediaBasic {
    _id?: RecordId;
    // fields
    id: DocumentId; // no longer optional for saved records
    mime_type: string; // no longer optional for saved records
    category: MediaCategory; // no longer optional for saved records
    size: number; // no longer optional for saved records
    data_storage_type: MediaRecordDataStorageType;
    data?: Buffer; // for data in record
    // data_id? string; // for data in other system / gridfs
    // visibility
    // no change
}
