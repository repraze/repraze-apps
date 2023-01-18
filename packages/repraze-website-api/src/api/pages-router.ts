import {SortType} from "@repraze/website-lib/types/api";
import {URLId} from "@repraze/website-lib/types/document";
import {Page, PageSortFields} from "@repraze/website-lib/types/page";
import {default as express} from "express";
import {z} from "zod";

import {
    PageFilterParams,
    PagePageParams,
    PageSortParams,
    countPages,
    createPage,
    deletePage,
    getPage,
    listPages,
    updatePage,
} from "../controllers/page-controller";
import {
    ApiCodes,
    ApiError,
    booleanQueryField,
    endpointHandler,
    intQueryField,
    makeDataResponse,
    makeStatusResponse,
    sortQueryField,
} from "./api-utils";

export const pagesRouter = express.Router();

// general

// list pages
pagesRouter.get(
    "/",
    endpointHandler(
        z.object({
            query: z.object({
                // pagination
                limit: z.preprocess(intQueryField, z.number().int().min(1).max(100).default(25)),
                skip: z.preprocess(intQueryField, z.number().int().min(0).default(0)),
                // filter
                public: z.optional(z.preprocess(booleanQueryField, z.boolean())),
                // sort
                sort: z.optional(z.preprocess(sortQueryField, z.object({field: PageSortFields, type: SortType}))),
                // search
                search: z.optional(z.string().max(256)),
            }),
        }),
        async (req, res, next, args) => {
            // unauthenticated defaults
            const filterParams: PageFilterParams = {
                public: true, // can only view public pages
            };
            let sortParams: PageSortParams = [{field: "creation_date", type: "desc"}];
            const pageParams: PagePageParams = {
                limit: args.query.limit,
                skip: args.query.skip,
            };
            // authenticated
            if (req.auth) {
                if (args.query.sort) {
                    sortParams = [args.query.sort];
                }
                filterParams.public = args.query.public;
                filterParams.search = args.query.search;
            }
            const [pages, pageCount] = await Promise.all([
                listPages(filterParams, sortParams, pageParams, {featured_media: true, meta: !!req.auth}),
                countPages(filterParams),
            ]);
            const meta = {filter: filterParams, sort: sortParams, page: pageParams, count: pageCount};
            res.json(makeDataResponse(pages, meta));
        }
    )
);

// create a new page
pagesRouter.post(
    "/",
    endpointHandler(
        z.object({
            body: Page,
        }),
        async (req, res, next, args) => {
            if (req.auth) {
                const pageData = args.body;
                const userObjectId = req.auth.userObjectId;
                const page = await createPage(userObjectId, pageData, {featured_media: true, meta: !!req.auth});
                res.status(ApiCodes.created).json(makeDataResponse(page));
            } else {
                throw new ApiError("Authentication required", ApiCodes.forbidden);
            }
        }
    )
);

// item

// get a page
pagesRouter.get(
    "/:id",
    endpointHandler(
        z.object({
            params: z.object({
                id: URLId,
            }),
        }),
        async (req, res, next, args) => {
            const pageId = args.params.id;
            // unauthenticated defaults
            const filterParams: PageFilterParams = {
                public: true, // can only view public pages
            };
            // authenticated
            if (req.auth) {
                filterParams.public = undefined;
            }
            const page = await getPage(pageId, filterParams, {featured_media: true, meta: !!req.auth});
            if (page !== null) {
                res.json(makeDataResponse(page));
            } else {
                throw new ApiError("Page not found", ApiCodes.notFound);
            }
        }
    )
);

// update a page
pagesRouter.patch(
    "/:id",
    endpointHandler(
        z.object({
            params: z.object({
                id: URLId,
            }),
            body: Page,
        }),
        async (req, res, next, args) => {
            if (req.auth) {
                const pageId = args.params.id;
                const pageData = args.body;
                const userObjectId = req.auth.userObjectId;
                const page = await updatePage(pageId, userObjectId, pageData, {featured_media: true, meta: !!req.auth});
                if (page !== null) {
                    res.json(makeDataResponse(page));
                } else {
                    throw new ApiError("Page not found", ApiCodes.notFound);
                }
            } else {
                throw new ApiError("Authentication required", ApiCodes.forbidden);
            }
        }
    )
);

// remove a page
pagesRouter.delete(
    "/:id",
    endpointHandler(
        z.object({
            params: z.object({
                id: URLId,
            }),
        }),
        async (req, res, next, args) => {
            if (req.auth) {
                const pageId = args.params.id;
                const page = await deletePage(pageId, {featured_media: true, meta: !!req.auth});
                if (page !== null) {
                    res.json(makeStatusResponse("Page deleted"));
                } else {
                    throw new ApiError("Page not found", ApiCodes.notFound);
                }
            } else {
                throw new ApiError("Authentication required", ApiCodes.forbidden);
            }
        }
    )
);
