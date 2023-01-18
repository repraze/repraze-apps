import {default as express} from "express";
import {z} from "zod";

import {getUserByObjectId} from "../controllers/user-controller";
import {ApiCodes, ApiError, endpointHandler, makeDataResponse} from "./api-utils";

export const userRouter = express.Router();

// general

// get current user
userRouter.get(
    "/",
    endpointHandler(z.object({}), async (req, res, next) => {
        if (req.auth) {
            const userObjectId = req.auth.userObjectId;
            const user = await getUserByObjectId(userObjectId, {profile_media: true});
            if (user !== null) {
                res.json(makeDataResponse(user));
            } else {
                throw new ApiError("User not found", ApiCodes.notFound);
            }
        } else {
            throw new ApiError("Authentication required", ApiCodes.forbidden);
        }
    })
);
