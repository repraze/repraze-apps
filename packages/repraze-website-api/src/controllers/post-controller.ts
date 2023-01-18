import {dedupeArray} from "@repraze/lib-utils/array-utils";
import {SortType} from "@repraze/website-lib/types/api";
import {DocumentId, TagString, makeDocumentId} from "@repraze/website-lib/types/document";
import {Post, PostSortFields} from "@repraze/website-lib/types/post";
import {PostBasic} from "@repraze/website-lib/types/post-basic";
import {FilterQuery} from "mongoose";

import {PostBasicRecord} from "../models/post-basic-record";
import {PostModel} from "../models/post-model";
import {PostRecord} from "../models/post-record";
import {RecordId, isValidRecordId} from "../models/record";
import {filterEmpties} from "./controller-utils";
import {makeUpdateRecord} from "./controller-utils";
import {getMediaObjectId, resolveMediaRecord, resolveMediaRecordId} from "./media-controller";
import {getUserObjectId, resolveUserRecord, resolveUserRecordId} from "./user-controller";

export interface PostFilterParams {
    // filter
    published?: boolean;
    public?: boolean;
    listed?: boolean;
    featured?: boolean;
    tags?: TagString[];
    search?: string;
}

function parsePostFilterParams(params: PostFilterParams) {
    const filter: FilterQuery<PostRecord> = {};
    if (params.published !== undefined) {
        // published post are public and past their required publish date
        if (params.published === true) {
            filter.public = true;
            filter.publish_date = {$lt: new Date()};
            // filter.$and = [{publish_date: {$lt: new Date()}}, {publish_date: {$ne: undefined}}];
        } else {
            filter.$or = [{public: {$eq: false}}, {publish_date: {$eq: undefined}}, {publish_date: {$gte: new Date()}}];
        }
    } else {
        // published sets public
        if (params.public !== undefined) {
            filter.public = params.public;
        }
    }
    if (params.listed !== undefined) {
        filter.listed = params.listed;
    }
    if (params.featured !== undefined) {
        filter.featured = params.featured;
    }
    if (params.tags !== undefined && params.tags.length > 0) {
        // must match with all filter tags given
        filter.tags = {$all: params.tags};
    }
    if (params.search !== undefined && params.search.trim() !== "") {
        filter.$text = {$search: params.search};
    }
    return filter;
}

export type PostSortParams = {
    // sort
    field: PostSortFields;
    type: SortType;
}[];

function parsePostSortParams(params: PostSortParams) {
    return params.reduce<Partial<{[key in PostSortFields]: SortType}>>((sort, sortParam) => {
        sort[sortParam.field] = sortParam.type;
        return sort;
    }, {});
}

export interface PostPageParams {
    // pagination
    limit?: number;
    skip?: number;
}

export interface PostExpandParams {
    // expand
    authors?: boolean;
    featured_media?: boolean;
    meta?: boolean;
}

async function cleanPostBasicRecord(record: PostBasicRecord, expandParams: PostExpandParams = {}): Promise<PostBasic> {
    // dependencies
    const [authorUserIds, featuredMediaId] = await Promise.all([
        Promise.all(record.author_users.map(resolveUserRecordId)).then(filterEmpties),
        record.featured_media ? resolveMediaRecordId(record.featured_media) : undefined,
    ]);

    const basicPost: Post = {
        // fields
        id: record.id,
        title: record.title,
        summary: record.summary,
        content: record.content,
        tags: record.tags,
        author_user_ids: authorUserIds,
        featured_media_id: featuredMediaId || null,
        // visibility
        public: record.public,
        listed: record.listed,
        featured: record.featured,
        publish_date: record.publish_date,
    };

    // authors
    if (expandParams.authors) {
        const authorUsers = await Promise.all(
            record.author_users.map((u) => resolveUserRecord(u, {profile_media: true}))
        ).then(filterEmpties);
        basicPost.author_users = authorUsers;
    }

    // featured_media
    if (expandParams.featured_media && record.featured_media) {
        const featuredMedia = await resolveMediaRecord(record.featured_media);
        basicPost.featured_media = featuredMedia || undefined;
    }

    return basicPost;
}

async function cleanPostRecord(record: PostRecord, expandParams: PostExpandParams = {}): Promise<Post> {
    // dependencies
    const [post, creationUserId, lastEditUserId] = await Promise.all([
        cleanPostBasicRecord(record, expandParams) as Promise<Post>,
        resolveUserRecordId(record.creation_user),
        resolveUserRecordId(record.last_edit_user),
    ]);

    // meta
    if (expandParams.meta) {
        const [creationUser, lastEditUser] = await Promise.all([
            resolveUserRecord(record.creation_user, {profile_media: true}),
            resolveUserRecord(record.last_edit_user, {profile_media: true}),
        ]);
        post.creation_date = record.creation_date;
        post.creation_user_id = creationUserId;
        post.creation_user = creationUser || undefined;
        post.last_edit_date = record.last_edit_date;
        post.last_edit_user_id = lastEditUserId;
        post.last_edit_user = lastEditUser || undefined;
        post.comment = record.comment;
    }

    return post;
}

// lifecycle

export async function createPost(
    creatorUserObjectId: RecordId,
    post: Post,
    expandParams: PostExpandParams = {}
): Promise<Post> {
    const [authorUserObjectIds, featuredMediaObjectId] = await Promise.all([
        Promise.all(dedupeArray(post.author_user_ids).map(getUserObjectId)).then(filterEmpties),
        post.featured_media_id ? getMediaObjectId(post.featured_media_id) : undefined,
    ]);

    const newPostRecord: PostRecord = {
        // fields
        id: makeDocumentId(),
        title: post.title,
        summary: post.summary,
        content: post.content,
        tags: dedupeArray(post.tags),
        author_users: authorUserObjectIds,
        featured_media: featuredMediaObjectId,
        // visibility
        public: post.public,
        listed: post.listed,
        featured: post.featured,
        publish_date: post.publish_date ? new Date(post.publish_date) : null,
        // meta
        creation_date: new Date(),
        creation_user: creatorUserObjectId,
        last_edit_date: new Date(),
        last_edit_user: creatorUserObjectId,
        comment: post.comment || "",
    };
    const record = await PostModel.create(newPostRecord);
    return cleanPostRecord(record, expandParams);
}

export async function listPosts(
    filterParams: PostFilterParams = {},
    sortParams: PostSortParams = [],
    pageParams: PostPageParams = {},
    expandParams: PostExpandParams = {}
): Promise<Post[]> {
    const filter = parsePostFilterParams(filterParams);

    const postQuery = PostModel.find(filter, null, {
        lean: true,
        populate: ["author_users", "creation_user", "last_edit_user"],
        limit: pageParams.limit,
        skip: pageParams.skip,
    });
    if (sortParams.length > 0) {
        const sort = parsePostSortParams(sortParams);
        postQuery.sort(sort);
    }
    const postRecords = await postQuery.exec();
    return Promise.all(postRecords.map((p) => cleanPostRecord(p, expandParams)));
}

export async function countPosts(filterParams: PostFilterParams = {}): Promise<number> {
    const filter = parsePostFilterParams(filterParams);
    const postCount = await PostModel.countDocuments(filter);
    return postCount;
}

export async function getPost(
    id: DocumentId,
    filterParams: PostFilterParams = {},
    expandParams: PostExpandParams = {}
): Promise<Post | null> {
    const filter = parsePostFilterParams(filterParams);
    filter.id = id;
    const postRecord = await PostModel.findOne(filter, null, {
        lean: true,
        populate: ["author_users", "creation_user", "last_edit_user"],
    }).exec();
    return postRecord ? cleanPostRecord(postRecord, expandParams) : null;
}

export async function deletePost(id: DocumentId, expandParams: PostExpandParams = {}): Promise<Post | null> {
    const postRecord = await PostModel.findOneAndDelete(
        {id},
        {lean: true, populate: ["author_users", "creation_user", "last_edit_user"]}
    ).exec();
    return postRecord ? cleanPostRecord(postRecord, expandParams) : null;
}

export async function updatePost(
    id: DocumentId,
    editorUserObjectId: RecordId,
    post: Post,
    expandParams: PostExpandParams = {}
): Promise<Post | null> {
    const [authorUserObjectIds, featuredMediaObjectId] = await Promise.all([
        Promise.all(dedupeArray(post.author_user_ids).map(getUserObjectId)).then(filterEmpties),
        post.featured_media_id ? getMediaObjectId(post.featured_media_id) : undefined,
    ]);

    const updateDoc = makeUpdateRecord<PostRecord>({
        // fields
        title: post.title,
        summary: post.summary,
        content: post.content,
        tags: dedupeArray(post.tags),
        author_users: authorUserObjectIds,
        featured_media: featuredMediaObjectId,
        // visibility
        public: post.public,
        listed: post.listed,
        featured: post.featured,
        publish_date: post.publish_date ? new Date(post.publish_date) : null,
        // meta
        last_edit_date: new Date(),
        last_edit_user: editorUserObjectId,
        comment: post.comment || "",
    });

    const postRecord = await PostModel.findOneAndUpdate({id}, updateDoc, {
        new: true,
        populate: ["author_users", "creation_user", "last_edit_user"],
    }).exec();
    return postRecord ? cleanPostRecord(postRecord, expandParams) : null;
}

export async function getRelatedPosts(
    id: DocumentId,
    filterParams: PostFilterParams = {},
    sortParams: PostSortParams = [],
    pageParams: PostPageParams = {},
    expandParams: PostExpandParams = {}
): Promise<Post[] | null> {
    const filter = parsePostFilterParams(filterParams);
    filter.id = id;
    const postRecord = await PostModel.findOne(filter, null, {
        lean: true,
    }).exec();

    if (postRecord) {
        const listFilter = parsePostFilterParams({
            published: filterParams.published,
            public: filterParams.public,
            listed: true,
        });
        listFilter.tags = {$in: postRecord.tags || []}; // partial match tags
        listFilter.id = {$ne: id}; // remove same post

        const postQuery = PostModel.find(listFilter, null, {
            lean: true,
            populate: ["author_users", "creation_user", "last_edit_user"],
            limit: pageParams.limit,
            skip: pageParams.skip,
        });
        if (sortParams.length > 0) {
            const sort = parsePostSortParams(sortParams);
            postQuery.sort(sort);
        }
        const postRecords = await postQuery.exec();
        return Promise.all(postRecords.map((p) => cleanPostRecord(p, expandParams)));
    } else {
        return null;
    }
}

// utilities

export async function getPostByObjectId(objectId: RecordId, expandParams: PostExpandParams = {}): Promise<Post | null> {
    const postRecord = await PostModel.findById(objectId, null, {
        lean: true,
        populate: ["author_users", "creation_user", "last_edit_user"],
    }).exec();
    return postRecord ? cleanPostRecord(postRecord, expandParams) : null;
}

export async function getPostObjectId(id: DocumentId): Promise<RecordId | undefined> {
    const postRecord = await PostModel.findOne({id}, null, {
        lean: true,
    }).exec();
    return postRecord ? postRecord._id : undefined;
}

export async function getPostIdByObjectId(objectId: RecordId): Promise<DocumentId | undefined> {
    const postRecord = await PostModel.findById(objectId, null, {
        lean: true,
    }).exec();
    return postRecord ? postRecord.id : undefined;
}

// resolution

export async function resolvePostRecord(
    objectIdOrRecord: RecordId | PostBasicRecord,
    expandParams: PostExpandParams = {}
): Promise<PostBasic | null> {
    return isValidRecordId(objectIdOrRecord)
        ? getPostByObjectId(objectIdOrRecord, expandParams)
        : cleanPostBasicRecord(objectIdOrRecord, expandParams);
}

export async function resolvePostRecordId(
    objectIdOrRecord: RecordId | PostBasicRecord
): Promise<DocumentId | undefined> {
    return isValidRecordId(objectIdOrRecord) ? getPostIdByObjectId(objectIdOrRecord) : objectIdOrRecord.id;
}
