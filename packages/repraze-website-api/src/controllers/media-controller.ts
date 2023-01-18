import {SortType} from "@repraze/website-lib/types/api";
import {DocumentId, makeDocumentId} from "@repraze/website-lib/types/document";
import {Media, MediaSortFields} from "@repraze/website-lib/types/media";
import {MediaBasic, MediaCategory, categorizeMedia} from "@repraze/website-lib/types/media-basic";
import mime from "mime";
import {FilterQuery} from "mongoose";

import {MediaBasicRecord, MediaRecordDataStorageType} from "../models/media-basic-record";
import {MediaModel} from "../models/media-model";
import {MediaRecord} from "../models/media-record";
import {RecordId, isValidRecordId} from "../models/record";
import {makeUpdateRecord} from "./controller-utils";
import {resolveUserRecord, resolveUserRecordId} from "./user-controller";

export interface MediaFilterParams {
    // filter
    public?: boolean;
    category?: MediaCategory;
    search?: string;
}

function parseMediaFilterParams(params: MediaFilterParams) {
    const filter: FilterQuery<MediaRecord> = {};
    if (params.public !== undefined) {
        filter.public = params.public;
    }
    if (params.category !== undefined) {
        filter.category = params.category;
    }
    if (params.search !== undefined && params.search.trim() !== "") {
        filter.$text = {$search: params.search};
    }
    return filter;
}

export type MediaSortParams = {
    // sort
    field: MediaSortFields;
    type: SortType;
}[];

function parseMediaSortParams(params: MediaSortParams) {
    return params.reduce<Partial<{[key in MediaSortFields]: SortType}>>((sort, sortParam) => {
        sort[sortParam.field] = sortParam.type;
        return sort;
    }, {});
}

export interface MediaPageParams {
    // pagination
    limit?: number;
    skip?: number;
}

export interface MediaExpandParams {
    // expand
    meta?: boolean;
}

export type MediaData = {
    mime_type?: string;
    extension?: string;
    size: number;
    data_storage_type?: MediaRecordDataStorageType;
    data: Buffer;
};

async function cleanMediaBasicRecord(
    record: MediaBasicRecord,
    expandParams: MediaExpandParams = {}
): Promise<MediaBasic> {
    // dependencies
    // none

    const basicMedia: Media = {
        // fields
        id: record.id,
        title: record.title,
        summary: record.summary,
        mime_type: record.mime_type,
        extension: record.extension,
        category: record.category,
        size: record.size,
        // visibility
        public: record.public,
    };

    return basicMedia;
}

async function cleanMediaRecord(record: MediaRecord, expandParams: MediaExpandParams = {}): Promise<Media> {
    // dependencies
    const [media, creationUserId, lastEditUserId] = await Promise.all([
        cleanMediaBasicRecord(record, expandParams) as Promise<Media>,
        resolveUserRecordId(record.creation_user),
        resolveUserRecordId(record.last_edit_user),
    ]);

    // meta
    if (expandParams.meta) {
        const [creationUser, lastEditUser] = await Promise.all([
            resolveUserRecord(record.creation_user, {profile_media: true}),
            resolveUserRecord(record.last_edit_user, {profile_media: true}),
        ]);
        media.creation_date = record.creation_date;
        media.creation_user_id = creationUserId;
        media.creation_user = creationUser || undefined;
        media.last_edit_date = record.last_edit_date;
        media.last_edit_user_id = lastEditUserId;
        media.last_edit_user = lastEditUser || undefined;
        media.comment = record.comment || "";
    }

    return media;
}

// lifecycle

export async function createMedia(
    creatorUserObjectId: RecordId,
    media: Media,
    mediaData: MediaData,
    expandParams: MediaExpandParams = {}
): Promise<Media> {
    const mimetype = mediaData.extension
        ? mime.getType(mediaData.extension) || "application/octet-stream"
        : "application/octet-stream";

    const newMediaRecord: MediaRecord = {
        // fields
        id: makeDocumentId(),
        title: media.title,
        summary: media.summary,
        mime_type: mimetype,
        extension: mediaData.extension || null,
        category: categorizeMedia(mimetype, mediaData.extension),
        size: mediaData.size,
        data_storage_type: "record_buffer",
        data: mediaData.data,
        // visibility
        public: media.public,
        // meta
        creation_date: new Date(),
        creation_user: creatorUserObjectId,
        last_edit_date: new Date(),
        last_edit_user: creatorUserObjectId,
        comment: media.comment || "",
    };
    const record = await MediaModel.create(newMediaRecord);
    return cleanMediaRecord(record, expandParams);
}

export async function listMedias(
    filterParams: MediaFilterParams = {},
    sortParams: MediaSortParams = [],
    pageParams: MediaPageParams = {},
    expandParams: MediaExpandParams = {}
): Promise<Media[]> {
    const filter = parseMediaFilterParams(filterParams);
    const mediaQuery = MediaModel.find(filter, null, {
        lean: true,
        populate: ["creation_user", "last_edit_user"],
        limit: pageParams.limit,
        skip: pageParams.skip,
    });
    if (sortParams.length > 0) {
        const sort = parseMediaSortParams(sortParams);
        mediaQuery.sort(sort);
    }
    const mediaRecords = await mediaQuery.exec();
    return Promise.all(mediaRecords.map((m) => cleanMediaRecord(m, expandParams)));
}

export async function countMedias(filterParams: MediaFilterParams = {}): Promise<number> {
    const filter = parseMediaFilterParams(filterParams);
    const mediaCount = await MediaModel.countDocuments(filter);
    return mediaCount;
}

export async function getMedia(
    id: DocumentId,
    filterParams: MediaFilterParams = {},
    expandParams: MediaExpandParams = {}
): Promise<Media | null> {
    const filter = parseMediaFilterParams(filterParams);
    filter.id = id;
    const mediaRecord = await MediaModel.findOne(filter, null, {
        lean: true,
        populate: ["creation_user", "last_edit_user"],
    }).exec();
    return mediaRecord ? cleanMediaRecord(mediaRecord, expandParams) : null;
}

export async function getMediaData(id: DocumentId, filterParams: MediaFilterParams = {}): Promise<MediaData | null> {
    const filter = parseMediaFilterParams(filterParams);
    filter.id = id;
    const mediaDataRecord = await MediaModel.findOne(
        filter,
        ["mime_type", "extension", "size", "data_storage_type", "data"],
        {
            lean: true,
        }
    ).exec();

    if (mediaDataRecord) {
        if (mediaDataRecord.data_storage_type === "record_buffer" && mediaDataRecord.data) {
            return {
                mime_type: mediaDataRecord.mime_type,
                extension: mediaDataRecord.extension || undefined,
                size: mediaDataRecord.size,
                data_storage_type: mediaDataRecord.data_storage_type,
                data: mediaDataRecord.data.buffer as Buffer,
            };
        }
    }
    return null;
}

export async function deleteMedia(id: DocumentId, expandParams: MediaExpandParams = {}): Promise<Media | null> {
    const mediaRecord = await MediaModel.findOneAndDelete(
        {id},
        {lean: true, populate: ["creation_user", "last_edit_user"]}
    ).exec();
    return mediaRecord ? cleanMediaRecord(mediaRecord, expandParams) : null;
}

export async function updateMedia(
    id: DocumentId,
    editorUserObjectId: RecordId,
    media: Media,
    expandParams: MediaExpandParams = {}
): Promise<Media | null> {
    const updateMediaRecord = makeUpdateRecord<MediaRecord>({
        // fields
        title: media.title,
        summary: media.summary,
        // visibility
        public: media.public,
        // meta
        last_edit_date: new Date(),
        last_edit_user: editorUserObjectId,
        comment: media.comment || "",
    });

    const mediaRecord = await MediaModel.findOneAndUpdate({id}, updateMediaRecord, {
        new: true,
        populate: ["creation_user", "last_edit_user"],
    }).exec();
    return mediaRecord ? cleanMediaRecord(mediaRecord, expandParams) : null;
}

export async function updateMediaData(
    id: DocumentId,
    editorUserObjectId: RecordId,
    mediaData: MediaData
): Promise<MediaData | null> {
    const mimetype = mediaData.extension
        ? mime.getType(mediaData.extension) || "application/octet-stream"
        : "application/octet-stream";

    const updateMediaDataRecord: Partial<MediaRecord> = {
        // fields
        mime_type: mimetype,
        extension: mediaData.extension || undefined,
        category: categorizeMedia(mimetype, mediaData.extension),
        size: mediaData.size,
        data_storage_type: "record_buffer",
        data: mediaData.data,
    };

    const mediaDataRecord = await MediaModel.findOneAndUpdate({id}, updateMediaDataRecord, {
        new: true,
        populate: ["mime_type", "extension", "size", "data_storage_type", "data"],
    }).exec();

    if (mediaDataRecord) {
        if (mediaDataRecord.data_storage_type === "record_buffer" && mediaDataRecord.data) {
            return {
                mime_type: mediaDataRecord.mime_type,
                extension: mediaDataRecord.extension || undefined,
                size: mediaDataRecord.size,
                data_storage_type: mediaDataRecord.data_storage_type,
                data: mediaDataRecord.data.buffer as Buffer,
            };
        }
    }
    return null;
}

// utilities

export async function getMediaByObjectId(
    objectId: RecordId,
    expandParams: MediaExpandParams = {}
): Promise<Media | null> {
    const mediaRecord = await MediaModel.findById(objectId, null, {
        lean: true,
        populate: ["creation_user", "last_edit_user"],
    }).exec();
    return mediaRecord ? cleanMediaRecord(mediaRecord, expandParams) : null;
}

export async function getMediaObjectId(id: DocumentId): Promise<RecordId | undefined> {
    const mediaRecord = await MediaModel.findOne({id}, null, {
        lean: true,
    }).exec();
    return mediaRecord ? mediaRecord._id : undefined;
}

export async function getMediaIdByObjectId(objectId: RecordId): Promise<DocumentId | undefined> {
    const mediaRecord = await MediaModel.findById(objectId, null, {
        lean: true,
    }).exec();
    return mediaRecord ? mediaRecord.id : undefined;
}

// resolution

export async function resolveMediaRecord(
    objectIdOrRecord: RecordId | MediaBasicRecord,
    expandParams: MediaExpandParams = {}
): Promise<MediaBasic | null> {
    return isValidRecordId(objectIdOrRecord)
        ? getMediaByObjectId(objectIdOrRecord, expandParams)
        : cleanMediaBasicRecord(objectIdOrRecord, expandParams);
}

export async function resolveMediaRecordId(
    objectIdOrRecord: RecordId | MediaBasicRecord
): Promise<DocumentId | undefined> {
    return isValidRecordId(objectIdOrRecord) ? getMediaIdByObjectId(objectIdOrRecord) : objectIdOrRecord.id;
}
