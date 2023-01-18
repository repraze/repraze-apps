import {SortType} from "@repraze/website-lib/types/api";
import {User, UserAndPassword, UserSortFields} from "@repraze/website-lib/types/user";
import {Password, UserBasic, Username} from "@repraze/website-lib/types/user-basic";
import {FilterQuery} from "mongoose";

import {RecordId, isValidRecordId} from "../models/record";
import {UserBasicRecord} from "../models/user-basic-record";
import {UserModel} from "../models/user-model";
import {UserRecord} from "../models/user-record";
import {SCRYPT_DEFAULT_OPTION, hashPassword} from "./auth-controller";
import {makeUpdateRecord} from "./controller-utils";
import {getMediaObjectId, resolveMediaRecord, resolveMediaRecordId} from "./media-controller";

export interface UserFilterParams {
    // filter
    search?: string;
}

function parseUserFilterParams(params: UserFilterParams) {
    const filter: FilterQuery<UserRecord> = {};
    if (params.search !== undefined && params.search.trim() !== "") {
        filter.$text = {$search: params.search};
    }
    return filter;
}

export type UserSortParams = {
    // sort
    field: UserSortFields;
    type: SortType;
}[];

function parseUserSortParams(params: UserSortParams) {
    return params.reduce<Partial<{[key in UserSortFields]: SortType}>>((sort, sortParam) => {
        sort[sortParam.field] = sortParam.type;
        return sort;
    }, {});
}

export interface UserPageParams {
    // pagination
    limit?: number;
    skip?: number;
}

export interface UserExpandParams {
    // expand
    profile_media?: boolean;
    meta?: boolean;
}

async function cleanUserBasicRecord(record: UserBasicRecord, expandParams: UserExpandParams): Promise<UserBasic> {
    // dependencies
    const [profileMediaId] = await Promise.all([
        record.profile_media ? resolveMediaRecordId(record.profile_media) : undefined,
    ]);

    const basicUser: UserBasic = {
        username: record.username,
        name: record.name,
        email: record.email,
        bio: record.bio,
        profile_media_id: profileMediaId || null,
    };

    // profile_media
    if (expandParams.profile_media && record.profile_media) {
        const profileMedia = await resolveMediaRecord(record.profile_media);
        basicUser.profile_media = profileMedia || undefined;
    }

    return basicUser;
}

async function cleanUserRecord(record: UserRecord, expandParams: UserExpandParams): Promise<User> {
    // dependencies
    const [user, creationUserId, lastEditUserId] = await Promise.all([
        cleanUserBasicRecord(record, expandParams) as Promise<User>,
        record.creation_user ? resolveUserRecordId(record.creation_user) : undefined,
        record.last_edit_user ? resolveUserRecordId(record.last_edit_user) : undefined,
    ]);

    // meta
    if (expandParams.meta) {
        const [creationUser, lastEditUser] = await Promise.all([
            record.creation_user ? resolveUserRecord(record.creation_user, {profile_media: true}) : undefined,
            record.last_edit_user ? resolveUserRecord(record.last_edit_user, {profile_media: true}) : undefined,
        ]);
        user.creation_date = record.creation_date;
        user.creation_user_id = creationUserId;
        user.creation_user = creationUser || undefined;
        user.last_edit_date = record.last_edit_date;
        user.last_edit_user_id = lastEditUserId;
        user.last_edit_user = lastEditUser || undefined;
        user.comment = record.comment;
    }

    return user;
}

// lifecycle

export async function createUser(
    creatorUserObjectId: RecordId | undefined,
    user: UserAndPassword,
    expandParams: UserExpandParams = {}
): Promise<User> {
    const [profileMediaObjectId] = await Promise.all([
        user.profile_media_id ? getMediaObjectId(user.profile_media_id) : undefined,
    ]);

    const newUserRecord: UserRecord = {
        // fields
        username: user.username,
        name: user.name,
        email: user.email,
        bio: user.bio,
        profile_media: profileMediaObjectId,
        // hidden
        password: await hashPassword(user.password, SCRYPT_DEFAULT_OPTION),
        // meta
        creation_date: new Date(),
        creation_user: creatorUserObjectId,
        last_edit_date: new Date(),
        last_edit_user: creatorUserObjectId,
        comment: user.comment || "",
    };
    const userRecord = await UserModel.create(newUserRecord);
    return cleanUserRecord(userRecord, expandParams);
}

export async function listUsers(
    filterParams: UserFilterParams = {},
    sortParams: UserSortParams = [],
    pageParams: UserPageParams = {},
    expandParams: UserExpandParams = {}
): Promise<User[]> {
    const filter = parseUserFilterParams(filterParams);
    const userQuery = UserModel.find(filter, null, {
        lean: true,
        populate: ["creation_user", "last_edit_user"],
        limit: pageParams.limit,
        skip: pageParams.skip,
    });
    if (sortParams.length > 0) {
        const sort = parseUserSortParams(sortParams);
        userQuery.sort(sort);
    }
    const userRecords = await userQuery.exec();
    return Promise.all(userRecords.map((u) => cleanUserRecord(u, expandParams)));
}

export async function countUsers(filterParams: UserFilterParams = {}): Promise<number> {
    const filter = parseUserFilterParams(filterParams);
    const postCount = await UserModel.countDocuments(filter);
    return postCount;
}

export async function getUser(
    username: Username,
    filterParams: UserFilterParams = {},
    expandParams: UserExpandParams = {}
): Promise<User | null> {
    const filter = parseUserFilterParams(filterParams);
    filter.username = username;
    const userRecord = await UserModel.findOne(filter, null, {
        lean: true,
        populate: ["creation_user", "last_edit_user"],
    }).exec();
    return userRecord ? cleanUserRecord(userRecord, expandParams) : null;
}

export async function deleteUser(username: Username, expandParams: UserExpandParams = {}): Promise<User | null> {
    const userRecord = await UserModel.findOneAndDelete(
        {username},
        {lean: true, populate: ["creation_user", "last_edit_user"]}
    ).exec();
    return userRecord ? cleanUserRecord(userRecord, expandParams) : null;
}

export async function updateUser(
    username: Username,
    editorUserObjectId: RecordId,
    user: User,
    expandParams: UserExpandParams = {}
): Promise<User | null> {
    const [profileMediaObjectId] = await Promise.all([
        user.profile_media_id ? getMediaObjectId(user.profile_media_id) : undefined,
    ]);

    const updateDoc = makeUpdateRecord<UserRecord>({
        // fields
        name: user.name,
        email: user.email,
        bio: user.bio,
        profile_media: profileMediaObjectId,
        // meta
        last_edit_date: new Date(),
        last_edit_user: editorUserObjectId,
        comment: user.comment || "",
    });

    const userRecord = await UserModel.findOneAndUpdate({username}, updateDoc, {
        new: true,
        populate: ["creation_user", "last_edit_user"],
    }).exec();
    return userRecord ? cleanUserRecord(userRecord, expandParams) : null;
}

export async function updateUserPassword(
    username: Username,
    password: Password,
    expandParams: UserExpandParams = {}
): Promise<User | null> {
    const updateDoc: Partial<UserRecord> = {
        // hidden
        password: await hashPassword(password, SCRYPT_DEFAULT_OPTION),
    };

    const userRecord = await UserModel.findOneAndUpdate({username}, updateDoc, {new: true}).exec();
    return userRecord ? cleanUserRecord(userRecord, expandParams) : null;
}

// utilities

export async function getUserByObjectId(objectId: RecordId, expandParams: UserExpandParams = {}): Promise<User | null> {
    const userRecord = await UserModel.findById(objectId, null, {
        lean: true,
        populate: ["creation_user", "last_edit_user"],
    }).exec();
    return userRecord ? cleanUserRecord(userRecord, expandParams) : null;
}

export async function getUserObjectId(username: Username): Promise<RecordId | undefined> {
    const userRecord = await UserModel.findOne({username}, null, {
        lean: true,
    }).exec();
    return userRecord ? userRecord._id : undefined;
}

export async function getUserIdByObjectId(objectId: RecordId): Promise<Username | undefined> {
    const userRecord = await UserModel.findById(objectId, null, {
        lean: true,
    }).exec();
    return userRecord ? userRecord.username : undefined;
}

// resolution

export async function resolveUserRecord(
    objectIdOrRecord: RecordId | UserBasicRecord,
    expandParams: UserExpandParams = {}
): Promise<UserBasic | null> {
    return isValidRecordId(objectIdOrRecord)
        ? getUserByObjectId(objectIdOrRecord)
        : cleanUserBasicRecord(objectIdOrRecord, expandParams);
}

export async function resolveUserRecordId(objectIdOrRecord: RecordId | UserBasicRecord): Promise<Username | undefined> {
    return isValidRecordId(objectIdOrRecord) ? getUserIdByObjectId(objectIdOrRecord) : objectIdOrRecord.username;
}
