import {SortType} from "@repraze/website-lib/types/api";
import {User, UserSortFields} from "@repraze/website-lib/types/user";
import {Username} from "@repraze/website-lib/types/user-basic";
import {default as express} from "express";
import {z} from "zod";

import {
    UserFilterParams,
    UserPageParams,
    UserSortParams,
    countUsers,
    getUser,
    listUsers,
    updateUser,
} from "../controllers/user-controller";
import {ApiCodes, ApiError, endpointHandler, intQueryField, makeDataResponse, sortQueryField} from "./api-utils";

export const usersRouter = express.Router();

// general

// list users
usersRouter.get(
    "/",
    endpointHandler(
        z.object({
            query: z.object({
                // pagination
                limit: z.preprocess(intQueryField, z.number().int().min(1).max(100).default(25)),
                skip: z.preprocess(intQueryField, z.number().int().min(0).default(0)),
                // sort
                sort: z.optional(z.preprocess(sortQueryField, z.object({field: UserSortFields, type: SortType}))),
                // search
                search: z.optional(z.string().max(256)),
            }),
        }),
        async (req, res, next, args) => {
            // authenticated
            if (req.auth) {
                const filterParams: UserFilterParams = {
                    search: args.query.search,
                };
                let sortParams: UserSortParams = [{field: "username", type: "desc"}];
                if (args.query.sort) {
                    sortParams = [args.query.sort];
                }
                const pageParams: UserPageParams = {
                    limit: args.query.limit,
                    skip: args.query.skip,
                };

                const [users, userCount] = await Promise.all([
                    listUsers(filterParams, sortParams, pageParams, {profile_media: true, meta: !!req.auth}),
                    countUsers(filterParams),
                ]);
                const meta = {filter: filterParams, sort: sortParams, page: pageParams, count: userCount};
                res.json(makeDataResponse(users, meta));
            } else {
                throw new ApiError("Authentication required", ApiCodes.forbidden);
            }
        }
    )
);

// item

// get a user
usersRouter.get(
    "/:username",
    endpointHandler(
        z.object({
            params: z.object({
                username: z.string(),
            }),
        }),
        async (req, res, next, args) => {
            const username = args.params.username;
            // unauthenticated defaults
            const filterParams: UserFilterParams = {};
            // authenticated
            // if (req.auth) {
            // empty
            // }
            const user = await getUser(username, filterParams, {
                profile_media: true,
                meta: !!req.auth,
            });
            if (user !== null) {
                res.json(makeDataResponse(user));
            } else {
                throw new ApiError("User not found", ApiCodes.notFound);
            }
        }
    )
);

// update a user
usersRouter.patch(
    "/:username",
    endpointHandler(
        z.object({
            params: z.object({
                username: Username,
            }),
            body: User,
        }),
        async (req, res, next, args) => {
            if (req.auth) {
                const username = args.params.username;
                const userData = args.body;
                const userObjectId = req.auth.userObjectId;
                const user = await updateUser(username, userObjectId, userData, {
                    profile_media: true,
                    meta: !!req.auth,
                });
                if (user !== null) {
                    res.json(makeDataResponse(user));
                } else {
                    throw new ApiError("User not found", ApiCodes.notFound);
                }
            } else {
                throw new ApiError("Authentication required", ApiCodes.forbidden);
            }
        }
    )
);
