import {UseMutationOptions, UseQueryOptions, useMutation, useQuery} from "@tanstack/react-query";

import {DocumentId, URLId} from "../../repraze-types/document";
import {Media, MediaSortFields, Medias} from "../../repraze-types/media";
import {MediaCategory} from "../../repraze-types/media-basic";
import {Page, PageSortFields, Pages} from "../../repraze-types/page";
import {Post, PostSortFields, Posts} from "../../repraze-types/post";
import {User, UserSortFields, Users} from "../../repraze-types/user";
import {Username} from "../../repraze-types/user-basic";
import {delay} from "../../repraze-utils/timing";
import {useApi} from "../providers/api";
import {ApiError} from "../providers/api/api";

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

export interface UsePostsParams {
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

export function usePosts(params: UsePostsParams, options?: UseQueryOptions<{posts: Posts; count: number}>) {
    const api = useApi();

    return useQuery({
        queryKey: ["posts", "list", params],
        queryFn: async () => {
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
        },
        ...options,
    });
}

export function usePost(id: DocumentId, options?: UseQueryOptions<{post: Post}>) {
    const api = useApi();

    return useQuery({
        queryKey: ["posts", id],
        queryFn: async () => {
            const response = await api.fetch(`posts/${id}`);
            const post = Post.parse(response.data);
            return {post};
        },
        ...options,
    });
}

export function usePostMutation(
    options?: UseMutationOptions<{post: Post}, unknown, {id: string | null; post: Post}, unknown>
) {
    const api = useApi();

    return useMutation<{post: Post}, unknown, {id: string | null; post: Post}, unknown>({
        mutationFn: async ({id, post}) => {
            if (id === null) {
                const response = await api.post(`posts`, post);
                return {post: Post.parse(response.data)};
            } else {
                const response = await api.patch(`posts/${id}`, post);
                return {post: Post.parse(response.data)};
            }
        },
        ...options,
    });
}

export function usePostRelated(id: DocumentId, options?: UseQueryOptions<{posts: Posts}>) {
    const api = useApi();

    return useQuery({
        queryKey: ["posts", id, "related"],
        queryFn: async () => {
            const response = await api.fetch(`posts/${id}/related`);
            const posts = Posts.parse(response.data);
            return {posts};
        },
        ...options,
    });
}

// pages

export interface UsePagesParams {
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

export function usePages(params: UsePagesParams, options?: UseQueryOptions<{pages: Pages; count: number}>) {
    const api = useApi();

    return useQuery({
        queryKey: ["pages", "list", params],
        queryFn: async () => {
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
        },
        ...options,
    });
}

export function usePage(id: URLId, options?: UseQueryOptions<{page: Page}>) {
    const api = useApi();

    return useQuery({
        queryKey: ["pages", id],
        queryFn: async () => {
            const response = await api.fetch(`pages/${id}`);
            const page = Page.parse(response.data);
            return {page};
        },
        ...options,
    });
}

export function usePageMutation(
    options?: UseMutationOptions<{page: Page}, unknown, {id: string | null; page: Page}, unknown>
) {
    const api = useApi();

    return useMutation<{page: Page}, unknown, {id: string | null; page: Page}, unknown>({
        mutationFn: async ({id, page}) => {
            if (id === null) {
                const response = await api.post(`pages`, page);
                return {page: Page.parse(response.data)};
            } else {
                const response = await api.patch(`pages/${id}`, page);
                return {page: Page.parse(response.data)};
            }
        },
        ...options,
    });
}

// medias

export interface UseMediasParams {
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

export function useMedias(params: UseMediasParams, options?: UseQueryOptions<{medias: Medias; count: number}>) {
    const api = useApi();

    return useQuery({
        queryKey: ["medias", "list", params],
        queryFn: async () => {
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
        },
        ...options,
    });
}

export function useMedia(id: URLId, options?: UseQueryOptions<{media: Media}>) {
    const api = useApi();

    return useQuery({
        queryKey: ["medias", id],
        queryFn: async () => {
            const response = await api.fetch(`medias/${id}`);
            const media = Media.parse(response.data);
            return {media};
        },
        ...options,
    });
}

export function useMediaMutation(
    options?: UseMutationOptions<{media: Media}, unknown, {id: string | null; media: Media; file?: File}, unknown>
) {
    const api = useApi();

    return useMutation<{media: Media}, unknown, {id: string | null; media: Media; file?: File}, unknown>({
        mutationFn: async ({id, media, file}) => {
            if (id === null) {
                if (file) {
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
                } else {
                    throw new ApiError("Media creation requires file");
                }
            } else {
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
        },
        ...options,
    });
}

export function useMediaFilesMutation(
    options?: UseMutationOptions<{medias: Medias}, unknown, {files: File[]}, unknown>
) {
    const api = useApi();

    return useMutation<{medias: Medias}, unknown, {files: File[]}, unknown>({
        mutationFn: async ({files}) => {
            if (files.length > 0) {
                const uploadFiles = new FormData();

                files.forEach((file) => {
                    uploadFiles.append("files", file, file.name);
                });

                await delay(3000);

                const response = await api.fetch(`medias/upload`, {
                    body: uploadFiles,
                    method: "POST",
                });
                return {medias: Medias.parse(response.data)};
            }
            return {medias: []};
        },
        ...options,
    });
}

// users

export interface UseUsersParams {
    // pagination
    limit?: number;
    skip?: number;
    // sort
    sort?: UserSortFields;
    // search
    search?: string;
}

export function useUsers(params: UseUsersParams, options?: UseQueryOptions<{users: Users; count: number}>) {
    const api = useApi();

    return useQuery({
        queryKey: ["users", "list", params],
        queryFn: async () => {
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
        },
        ...options,
    });
}

export function useUser(username: Username, options?: UseQueryOptions<{user: User}>) {
    const api = useApi();

    return useQuery({
        queryKey: ["users", username],
        queryFn: async () => {
            const response = await api.fetch(`users/${username}`);
            const user = User.parse(response.data);
            return {user};
        },
        ...options,
    });
}

export function useUserMutation(
    options?: UseMutationOptions<{user: User}, unknown, {username: string | null; user: User}, unknown>
) {
    const api = useApi();

    return useMutation<{user: User}, unknown, {username: string | null; user: User}, unknown>({
        mutationFn: async ({username, user}) => {
            if (username === null) {
                const response = await api.post(`users`, user);
                return {user: User.parse(response.data)};
            } else {
                const response = await api.patch(`users/${username}`, user);
                return {user: User.parse(response.data)};
            }
        },
        ...options,
    });
}
