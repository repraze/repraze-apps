import {SortType} from "@repraze/website-lib/types/api";
import {URLId} from "@repraze/website-lib/types/document";
import {Page, PageSortFields} from "@repraze/website-lib/types/page";
import {PageBasic} from "@repraze/website-lib/types/page-basics";
import {FilterQuery} from "mongoose";

import {PageBasicRecord} from "../models/page-basic-record";
import {PageModel} from "../models/page-model";
import {PageRecord} from "../models/page-record";
import {RecordId, isValidRecordId} from "../models/record";
import {makeUpdateRecord} from "./controller-utils";
import {getMediaObjectId, resolveMediaRecord, resolveMediaRecordId} from "./media-controller";
import {resolveUserRecord, resolveUserRecordId} from "./user-controller";

export interface PageFilterParams {
    // filter
    public?: boolean;
    search?: string;
}

function parsePageFilterParams(params: PageFilterParams) {
    const filter: FilterQuery<PageRecord> = {};
    if (params.public !== undefined) {
        filter.public = params.public;
    }
    if (params.search !== undefined && params.search.trim() !== "") {
        filter.$text = {$search: params.search};
    }
    return filter;
}

export type PageSortParams = {
    // sort
    field: PageSortFields;
    type: SortType;
}[];

function parsePageSortParams(params: PageSortParams) {
    return params.reduce<Partial<{[key in PageSortFields]: SortType}>>((sort, sortParam) => {
        sort[sortParam.field] = sortParam.type;
        return sort;
    }, {});
}

export interface PagePageParams {
    // pagination
    limit?: number;
    skip?: number;
}

export interface PageExpandParams {
    // expand
    featured_media?: boolean;
    meta?: boolean;
}

async function cleanPageBasicRecord(record: PageBasicRecord, expandParams: PageExpandParams = {}): Promise<PageBasic> {
    // dependencies
    const [featuredMediaId] = await Promise.all([
        record.featured_media ? resolveMediaRecordId(record.featured_media) : undefined,
    ]);

    const basicPage: Page = {
        // fields
        id: record.id,
        title: record.title,
        summary: record.summary,
        content: record.content,
        featured_media_id: featuredMediaId || null,
        // visibility
        public: record.public,
    };

    // featured_media
    if (expandParams.featured_media && record.featured_media) {
        const featuredMedia = await resolveMediaRecord(record.featured_media);
        basicPage.featured_media = featuredMedia || undefined;
    }

    return basicPage;
}

async function cleanPageRecord(record: PageRecord, expandParams: PageExpandParams = {}): Promise<Page> {
    // dependencies
    const [page, creationUserId, lastEditUserId] = await Promise.all([
        cleanPageBasicRecord(record, expandParams) as Promise<Page>,
        resolveUserRecordId(record.creation_user),
        resolveUserRecordId(record.last_edit_user),
    ]);

    // meta
    if (expandParams.meta) {
        const [creationUser, lastEditUser] = await Promise.all([
            resolveUserRecord(record.creation_user, {profile_media: true}),
            resolveUserRecord(record.last_edit_user, {profile_media: true}),
        ]);
        page.creation_date = record.creation_date;
        page.creation_user_id = creationUserId;
        page.creation_user = creationUser || undefined;
        page.last_edit_date = record.last_edit_date;
        page.last_edit_user_id = lastEditUserId;
        page.last_edit_user = lastEditUser || undefined;
        page.comment = record.comment || "";
    }

    return page;
}

// lifecycle

export async function createPage(
    creatorUserObjectId: RecordId,
    page: Page,
    expandParams: PageExpandParams = {}
): Promise<Page> {
    const [featuredMediaObjectId] = await Promise.all([
        page.featured_media_id ? getMediaObjectId(page.featured_media_id) : undefined,
    ]);

    const newPageRecord: PageRecord = {
        // fields
        id: page.id,
        title: page.title,
        summary: page.summary,
        content: page.content,
        featured_media: featuredMediaObjectId,
        // visibility
        public: page.public,
        // meta
        creation_date: new Date(),
        creation_user: creatorUserObjectId,
        last_edit_date: new Date(),
        last_edit_user: creatorUserObjectId,
        comment: page.comment || "",
    };
    const record = await PageModel.create(newPageRecord);
    return cleanPageRecord(record, expandParams);
}

export async function listPages(
    filterParams: PageFilterParams = {},
    sortParams: PageSortParams = [],
    pageParams: PagePageParams = {},
    expandParams: PageExpandParams = {}
): Promise<Page[]> {
    const filter = parsePageFilterParams(filterParams);
    const pageQuery = PageModel.find(filter, null, {
        lean: true,
        populate: ["creation_user", "last_edit_user"],
        limit: pageParams.limit,
        skip: pageParams.skip,
    });
    if (sortParams.length > 0) {
        const sort = parsePageSortParams(sortParams);
        pageQuery.sort(sort);
    }
    const pageRecords = await pageQuery.exec();
    return Promise.all(pageRecords.map((p) => cleanPageRecord(p, expandParams)));
}

export async function countPages(filterParams: PageFilterParams = {}): Promise<number> {
    const filter = parsePageFilterParams(filterParams);
    const pageCount = await PageModel.countDocuments(filter);
    return pageCount;
}

export async function getPage(
    id: URLId,
    filterParams: PageFilterParams = {},
    expandParams: PageExpandParams = {}
): Promise<Page | null> {
    const filter = parsePageFilterParams(filterParams);
    filter.id = id;
    const pageRecord = await PageModel.findOne(filter, null, {
        lean: true,
        populate: ["creation_user", "last_edit_user"],
    }).exec();
    return pageRecord ? cleanPageRecord(pageRecord, expandParams) : null;
}

export async function deletePage(id: URLId, expandParams: PageExpandParams = {}): Promise<Page | null> {
    const pageRecord = await PageModel.findOneAndDelete(
        {id},
        {lean: true, populate: ["creation_user", "last_edit_user"]}
    ).exec();
    return pageRecord ? cleanPageRecord(pageRecord, expandParams) : null;
}

export async function updatePage(
    id: URLId,
    editorUserObjectId: RecordId,
    page: Page,
    expandParams: PageExpandParams = {}
): Promise<Page | null> {
    const [featuredMediaObjectId] = await Promise.all([
        page.featured_media_id ? getMediaObjectId(page.featured_media_id) : undefined,
    ]);

    const updateDoc = makeUpdateRecord<PageRecord>({
        // fields
        id: page.id, // allow move
        title: page.title,
        summary: page.summary,
        content: page.content,
        featured_media: featuredMediaObjectId,
        // visibility
        public: page.public,
        // meta
        last_edit_date: new Date(),
        last_edit_user: editorUserObjectId,
        comment: page.comment || "",
    });

    console.log(updateDoc);

    const pageRecord = await PageModel.findOneAndUpdate({id}, updateDoc, {
        new: true,
        populate: ["creation_user", "last_edit_user"],
    }).exec();
    return pageRecord ? cleanPageRecord(pageRecord, expandParams) : null;
}

// utilities

export async function getPageByObjectId(objectId: RecordId, expandParams: PageExpandParams = {}): Promise<Page | null> {
    const pageRecord = await PageModel.findById(objectId, null, {
        lean: true,
        populate: ["creation_user", "last_edit_user"],
    }).exec();
    return pageRecord ? cleanPageRecord(pageRecord, expandParams) : null;
}

export async function getPageObjectId(id: URLId): Promise<RecordId | undefined> {
    const pageRecord = await PageModel.findOne({id}, null, {
        lean: true,
    }).exec();
    return pageRecord ? pageRecord._id : undefined;
}

export async function getPageIdByObjectId(objectId: RecordId): Promise<URLId | undefined> {
    const pageRecord = await PageModel.findById(objectId, null, {
        lean: true,
    }).exec();
    return pageRecord ? pageRecord.id : undefined;
}

// resolution

export async function resolvePageRecord(
    objectIdOrRecord: RecordId | PageBasicRecord,
    expandParams: PageExpandParams = {}
): Promise<PageBasic | null> {
    return isValidRecordId(objectIdOrRecord)
        ? getPageByObjectId(objectIdOrRecord, expandParams)
        : cleanPageBasicRecord(objectIdOrRecord, expandParams);
}

export async function resolvePediaRecordId(objectIdOrRecord: RecordId | PageBasicRecord): Promise<URLId | undefined> {
    return isValidRecordId(objectIdOrRecord) ? getPageIdByObjectId(objectIdOrRecord) : objectIdOrRecord.id;
}
