import {SortType} from "@repraze/website-lib/types/api";
import {DocumentId, TagString} from "@repraze/website-lib/types/document";
import {Post, PostSortFields} from "@repraze/website-lib/types/post";
import {default as express} from "express";
import {z} from "zod";

import {
    PostFilterParams,
    PostPageParams,
    PostSortParams,
    countPosts,
    createPost,
    deletePost,
    getPost,
    getRelatedPosts,
    listPosts,
    updatePost,
} from "../controllers/post-controller";
import {
    ApiCodes,
    ApiError,
    booleanQueryField,
    endpointHandler,
    intQueryField,
    makeDataResponse,
    makeStatusResponse,
    sortQueryField,
    stringArrayQueryField,
} from "./api-utils";

export const postsRouter = express.Router();

// general

// list posts
postsRouter.get(
    "/",
    endpointHandler(
        z.object({
            query: z.object({
                // pagination
                limit: z.preprocess(intQueryField, z.number().int().min(1).max(100).default(25)),
                skip: z.preprocess(intQueryField, z.number().int().min(0).default(0)),
                // filter
                published: z.optional(z.preprocess(booleanQueryField, z.boolean())),
                public: z.optional(z.preprocess(booleanQueryField, z.boolean())),
                listed: z.optional(z.preprocess(booleanQueryField, z.boolean())),
                featured: z.optional(z.preprocess(booleanQueryField, z.boolean())),
                tags: z.optional(z.preprocess(stringArrayQueryField, z.array(TagString))),
                // sort
                sort: z.optional(z.preprocess(sortQueryField, z.object({field: PostSortFields, type: SortType}))),
                // search
                search: z.optional(z.string().max(256)),
            }),
        }),
        async (req, res, next, args) => {
            // unauthenticated defaults
            const filterParams: PostFilterParams = {
                published: true, // can only view published post publicly
                public: true, // can only view public posts
                listed: true, // can only list listed posts
                tags: args.query.tags,
            };
            let sortParams: PostSortParams = [
                {field: "featured", type: "desc"},
                {field: "publish_date", type: "desc"},
            ];
            const pageParams: PostPageParams = {
                limit: args.query.limit,
                skip: args.query.skip,
            };
            // authenticated
            if (req.auth) {
                if (args.query.sort) {
                    sortParams = [args.query.sort];
                }
                filterParams.published = args.query.published;
                filterParams.public = args.query.public;
                filterParams.listed = args.query.listed;
                filterParams.featured = args.query.featured;
                filterParams.search = args.query.search;
            }
            const [posts, postCount] = await Promise.all([
                listPosts(filterParams, sortParams, pageParams, {
                    authors: true,
                    featured_media: true,
                    meta: !!req.auth,
                }),
                countPosts(filterParams),
            ]);
            const meta = {filter: filterParams, sort: sortParams, page: pageParams, count: postCount};
            res.json(makeDataResponse(posts, meta));
        }
    )
);

// create a new post
postsRouter.post(
    "/",
    endpointHandler(
        z.object({
            body: Post,
        }),
        async (req, res, next, args) => {
            if (req.auth) {
                const postData = args.body;
                const userObjectId = req.auth.userObjectId;
                const post = await createPost(userObjectId, postData, {
                    authors: true,
                    featured_media: true,
                    meta: !!req.auth,
                });
                res.status(ApiCodes.created).json(makeDataResponse(post));
            } else {
                throw new ApiError("Authentication required", ApiCodes.forbidden);
            }
        }
    )
);

// item

// get a post
postsRouter.get(
    "/:id",
    endpointHandler(
        z.object({
            params: z.object({
                id: DocumentId,
            }),
        }),
        async (req, res, next, args) => {
            const postId = args.params.id;
            // unauthenticated defaults
            const filterParams: PostFilterParams = {
                published: true, // can only view published post publicly
                public: true, // can only view public posts
            };
            // authenticated
            if (req.auth) {
                filterParams.published = undefined;
                filterParams.public = undefined;
            }
            const post = await getPost(postId, filterParams, {
                authors: true,
                featured_media: true,
                meta: !!req.auth,
            });
            if (post !== null) {
                res.json(makeDataResponse(post));
            } else {
                throw new ApiError("Post not found", ApiCodes.notFound);
            }
        }
    )
);

// update a post
postsRouter.patch(
    "/:id",
    endpointHandler(
        z.object({
            params: z.object({
                id: DocumentId,
            }),
            body: Post,
        }),
        async (req, res, next, args) => {
            if (req.auth) {
                const postId = args.params.id;
                const postData = args.body;
                const userObjectId = req.auth.userObjectId;
                const post = await updatePost(postId, userObjectId, postData, {
                    authors: true,
                    featured_media: true,
                    meta: !!req.auth,
                });
                if (post !== null) {
                    res.json(makeDataResponse(post));
                } else {
                    throw new ApiError("Post not found", ApiCodes.notFound);
                }
            } else {
                throw new ApiError("Authentication required", ApiCodes.forbidden);
            }
        }
    )
);

// remove a post
postsRouter.delete(
    "/:id",
    endpointHandler(
        z.object({
            params: z.object({
                id: DocumentId,
            }),
        }),
        async (req, res, next, args) => {
            if (req.auth) {
                const postId = args.params.id;
                const post = await deletePost(postId, {
                    authors: true,
                    featured_media: true,
                    meta: !!req.auth,
                });
                if (post !== null) {
                    res.json(makeStatusResponse("Post deleted"));
                } else {
                    throw new ApiError("Post not found", ApiCodes.notFound);
                }
            } else {
                throw new ApiError("Authentication required", ApiCodes.forbidden);
            }
        }
    )
);

// list related posts
postsRouter.get(
    "/:id/related",
    endpointHandler(
        z.object({
            params: z.object({
                id: DocumentId,
            }),
        }),
        async (req, res, next, args) => {
            const postId = args.params.id;
            // unauthenticated defaults
            const filterParams: PostFilterParams = {
                published: true, // can only view published post publicly
                public: true, // can only view public posts
            };
            const sortParams: PostSortParams = [
                {field: "featured", type: "desc"},
                {field: "publish_date", type: "desc"},
            ];
            const pageParams: PostPageParams = {
                limit: 5,
                skip: 0,
            };
            // authenticated
            if (req.auth) {
                filterParams.published = undefined;
                filterParams.public = undefined;
            }
            // search related posts
            const posts = await getRelatedPosts(postId, filterParams, sortParams, pageParams, {
                authors: true,
                featured_media: true,
                meta: !!req.auth,
            });
            if (posts !== null) {
                res.json(makeDataResponse(posts));
            } else {
                throw new ApiError("Post not found", ApiCodes.notFound);
            }
        }
    )
);
