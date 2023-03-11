import {DocumentId, URLId} from "@repraze/website-lib/types/document";
import {Media, MediaSortFields, Medias} from "@repraze/website-lib/types/media";
import {MediaCategory} from "@repraze/website-lib/types/media-basic";
import {Page, PageSortFields, Pages} from "@repraze/website-lib/types/page";
import {Post, PostSortFields, Posts} from "@repraze/website-lib/types/post";
import {User, UserSortFields, Users} from "@repraze/website-lib/types/user";
import {Username} from "@repraze/website-lib/types/user-basic";

import {ApiError, ApiFetcher} from "./api";

// utils

function setURLParam(URLParams: URLSearchParams, name: string, value?: boolean | number | string | string[]) {
    if (value !== undefined) {
        if (typeof value === "boolean") {
            URLParams.set(name, value ? "1" : "0");
        } else if (typeof value === "number") {
            URLParams.set(name, value.toString());
        } else if (typeof value === "string") {
            URLParams.set(name, value);
        } else if (Array.isArray(value) && value.length > 0) {
            URLParams.set(name, value.join(","));
        }
    } else {
        URLParams.delete(name);
    }
}

// posts

export interface ListPostsParams {
    // pagination
    limit?: number;
    skip?: number;
    // filter
    published?: boolean;
    public?: boolean;
    listed?: boolean;
    featured?: boolean;
    tags?: string[];
    // sort
    sort?: PostSortFields;
    // search
    search?: string;
}

export async function listPosts(api: ApiFetcher, params: ListPostsParams): Promise<{posts: Posts; count: number}> {
    const URLParams = new URLSearchParams();

    // pagination
    setURLParam(URLParams, "limit", params.limit);
    setURLParam(URLParams, "skip", params.skip);
    // filter
    setURLParam(URLParams, "published", params.published);
    setURLParam(URLParams, "public", params.public);
    setURLParam(URLParams, "listed", params.listed);
    setURLParam(URLParams, "featured", params.featured);
    setURLParam(URLParams, "tags", params.tags);
    // sort
    setURLParam(URLParams, "sort", params.sort);
    // search
    setURLParam(URLParams, "search", params.search);

    const response = await api.fetch(`posts?${URLParams}`);
    const posts = Posts.parse(response.data);
    const count: number = response.meta.count;
    return {posts, count};
}

export async function getPost(api: ApiFetcher, id: DocumentId): Promise<{post: Post}> {
    const response = await api.fetch(`posts/${id}`);
    const post = Post.parse(response.data);
    return {post};
}

export async function createPost(api: ApiFetcher, post: Post): Promise<{post: Post}> {
    const response = await api.post(`posts`, post);
    return {post: Post.parse(response.data)};
}

export async function updatePost(api: ApiFetcher, id: DocumentId, post: Post): Promise<{post: Post}> {
    const response = await api.patch(`posts/${id}`, post);
    return {post: Post.parse(response.data)};
}

export async function getPostRelated(api: ApiFetcher, id: DocumentId): Promise<{posts: Posts}> {
    const response = await api.fetch(`posts/${id}/related`);
    const posts = Posts.parse(response.data);
    return {posts};
}

// pages

export interface ListPagesParams {
    // pagination
    limit?: number;
    skip?: number;
    // filter
    public?: boolean;
    // sort
    sort?: PageSortFields;
    // search
    search?: string;
}

export async function listPages(api: ApiFetcher, params: ListPagesParams): Promise<{pages: Pages; count: number}> {
    const URLParams = new URLSearchParams();

    // pagination
    setURLParam(URLParams, "limit", params.limit);
    setURLParam(URLParams, "skip", params.skip);
    // filter
    setURLParam(URLParams, "public", params.public);
    // sort
    setURLParam(URLParams, "sort", params.sort);
    // search
    setURLParam(URLParams, "search", params.search);

    const response = await api.fetch(`pages?${URLParams}`);
    const pages = Pages.parse(response.data);
    const count: number = response.meta.count;
    return {pages, count};
}

export async function getPage(api: ApiFetcher, id: URLId): Promise<{page: Page}> {
    const response = await api.fetch(`pages/${id}`);
    const page = Page.parse(response.data);
    return {page};
}

export async function createPage(api: ApiFetcher, page: Page): Promise<{page: Page}> {
    const response = await api.post(`pages`, page);
    return {page: Page.parse(response.data)};
}

export async function updatePage(api: ApiFetcher, id: URLId, page: Page): Promise<{page: Page}> {
    const response = await api.patch(`pages/${id}`, page);
    return {page: Page.parse(response.data)};
}

// medias

export interface ListMediasParams {
    // pagination
    limit?: number;
    skip?: number;
    // filter
    public?: boolean;
    category?: MediaCategory;
    // sort
    sort?: MediaSortFields;
    // search
    search?: string;
}

export async function listMedias(api: ApiFetcher, params: ListMediasParams): Promise<{medias: Medias; count: number}> {
    const URLParams = new URLSearchParams();

    // pagination
    setURLParam(URLParams, "limit", params.limit);
    setURLParam(URLParams, "skip", params.skip);
    // filter
    setURLParam(URLParams, "public", params.public);
    setURLParam(URLParams, "category", params.category);
    // sort
    setURLParam(URLParams, "sort", params.sort);
    // search
    setURLParam(URLParams, "search", params.search);

    const response = await api.fetch(`medias?${URLParams}`);
    const medias = Medias.parse(response.data);
    const count: number = response.meta.count;
    return {medias, count};
}

export async function getMedia(api: ApiFetcher, id: DocumentId): Promise<{media: Media}> {
    const response = await api.fetch(`medias/${id}`);
    const media = Media.parse(response.data);
    return {media};
}

export async function createMedia(api: ApiFetcher, media: Media, file: File): Promise<{media: Media}> {
    // upload file first to create Media
    const mediaFile = new FormData();
    mediaFile.append("files", file, file.name);
    const uploadResponse = await api.fetch(`medias/upload`, {
        body: mediaFile,
        method: "POST",
    });
    const uploadMedias = Medias.parse(uploadResponse.data);
    if (uploadMedias.length > 0) {
        const uploadMediaId = uploadMedias[0].id;

        // then update details
        const response = await api.patch(`medias/${uploadMediaId}`, media);
        return {media: Media.parse(response.data)};
    } else {
        throw new ApiError("Media upload returned unexpected response");
    }
}

export async function updateMedia(api: ApiFetcher, id: DocumentId, media: Media, file?: File): Promise<{media: Media}> {
    // upload file if needed first
    if (file) {
        const mediaFile = new FormData();
        mediaFile.append("file", file, file.name);
        await api.fetch(`medias/${id}/upload`, {
            body: mediaFile,
            method: "POST",
        });
    }

    // update details
    const response = await api.patch(`medias/${id}`, media);
    return {media: Media.parse(response.data)};
}

export async function createMediaFiles(api: ApiFetcher, files: File[]): Promise<{medias: Medias}> {
    if (files.length > 0) {
        const uploadFiles = new FormData();

        files.forEach((file) => {
            uploadFiles.append("files", file, file.name);
        });

        const response = await api.fetch(`medias/upload`, {
            body: uploadFiles,
            method: "POST",
        });
        return {medias: Medias.parse(response.data)};
    }
    return {medias: []};
}

// users

export interface ListUsersParams {
    // pagination
    limit?: number;
    skip?: number;
    // sort
    sort?: UserSortFields;
    // search
    search?: string;
}

export async function listUsers(api: ApiFetcher, params: ListUsersParams): Promise<{users: Users; count: number}> {
    const URLParams = new URLSearchParams();

    // pagination
    setURLParam(URLParams, "limit", params.limit);
    setURLParam(URLParams, "skip", params.skip);
    // sort
    setURLParam(URLParams, "sort", params.sort);
    // search
    setURLParam(URLParams, "search", params.search);

    const response = await api.fetch(`users?${URLParams}`);
    const users = Users.parse(response.data);
    const count: number = response.meta.count;
    return {users, count};
}

export async function getUser(api: ApiFetcher, username: Username): Promise<{user: User}> {
    const response = await api.fetch(`users/${username}`);
    const user = User.parse(response.data);
    return {user};
}

export async function createUser(api: ApiFetcher, user: User): Promise<{user: User}> {
    const response = await api.post(`users`, user);
    return {user: User.parse(response.data)};
}

export async function updateUser(api: ApiFetcher, username: Username, user: User): Promise<{user: User}> {
    const response = await api.patch(`users/${username}`, user);
    return {user: User.parse(response.data)};
}

// user
export async function getCurrentUser(api: ApiFetcher): Promise<{user: User}> {
    const response = await api.get("user");
    const user = User.parse(response.data);
    return {user};
}
