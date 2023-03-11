import {DocumentId, URLId} from "@repraze/website-lib/types/document";
import {Media, Medias} from "@repraze/website-lib/types/media";
import {Page, Pages} from "@repraze/website-lib/types/page";
import {Post, Posts} from "@repraze/website-lib/types/post";
import {User, Users} from "@repraze/website-lib/types/user";
import {Username} from "@repraze/website-lib/types/user-basic";
import {UseMutationOptions, UseQueryOptions, useMutation, useQuery} from "@tanstack/react-query";

import {useApi} from "../providers/api";
import {ApiError} from "../providers/api/api";
import {
    ListMediasParams,
    ListPagesParams,
    ListPostsParams,
    ListUsersParams,
    createMedia,
    createMediaFiles,
    createPage,
    createPost,
    createUser,
    getCurrentUser,
    getMedia,
    getPage,
    getPost,
    getPostRelated,
    getUser,
    listMedias,
    listPages,
    listPosts,
    listUsers,
    updateMedia,
    updatePage,
    updatePost,
    updateUser,
} from "../providers/api/api-queries";

// posts

export function usePosts(params: ListPostsParams, options?: UseQueryOptions<{posts: Posts; count: number}>) {
    const api = useApi();

    return useQuery({
        queryKey: ["posts", "list", params],
        queryFn: async () => listPosts(api, params),
        ...options,
    });
}

export function usePost(id: DocumentId, options?: UseQueryOptions<{post: Post}>) {
    const api = useApi();

    return useQuery({
        queryKey: ["posts", id],
        queryFn: async () => getPost(api, id),
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
                return createPost(api, post);
            } else {
                return updatePost(api, id, post);
            }
        },
        ...options,
    });
}

export function usePostRelated(id: DocumentId, options?: UseQueryOptions<{posts: Posts}>) {
    const api = useApi();

    return useQuery({
        queryKey: ["posts", id, "related"],
        queryFn: async () => getPostRelated(api, id),
        ...options,
    });
}

// pages

export function usePages(params: ListPagesParams, options?: UseQueryOptions<{pages: Pages; count: number}>) {
    const api = useApi();

    return useQuery({
        queryKey: ["pages", "list", params],
        queryFn: async () => listPages(api, params),
        ...options,
    });
}

export function usePage(id: URLId, options?: UseQueryOptions<{page: Page}>) {
    const api = useApi();

    return useQuery({
        queryKey: ["pages", id],
        queryFn: async () => getPage(api, id),
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
                return createPage(api, page);
            } else {
                return updatePage(api, id, page);
            }
        },
        ...options,
    });
}

// medias

export function useMedias(params: ListMediasParams, options?: UseQueryOptions<{medias: Medias; count: number}>) {
    const api = useApi();

    return useQuery({
        queryKey: ["medias", "list", params],
        queryFn: async () => listMedias(api, params),
        ...options,
    });
}

export function useMedia(id: URLId, options?: UseQueryOptions<{media: Media}>) {
    const api = useApi();

    return useQuery({
        queryKey: ["medias", id],
        queryFn: async () => getMedia(api, id),
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
                    return createMedia(api, media, file);
                } else {
                    throw new ApiError("Media creation requires file");
                }
            } else {
                return updateMedia(api, id, media, file);
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
            return createMediaFiles(api, files);
        },
        ...options,
    });
}

// users

export function useUsers(params: ListUsersParams, options?: UseQueryOptions<{users: Users; count: number}>) {
    const api = useApi();

    return useQuery({
        queryKey: ["users", "list", params],
        queryFn: async () => listUsers(api, params),
        ...options,
    });
}

export function useUser(username: Username, options?: UseQueryOptions<{user: User}>) {
    const api = useApi();

    return useQuery({
        queryKey: ["users", username],
        queryFn: async () => getUser(api, username),
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
                return createUser(api, user);
            } else {
                return updateUser(api, username, user);
            }
        },
        ...options,
    });
}

// user

export function useCurrentUser(options?: UseQueryOptions<{user: User}>) {
    const api = useApi();

    return useQuery({
        queryKey: ["user"],
        queryFn: async () => getCurrentUser(api),
        ...options,
    });
}
