import {z} from "zod";

import {getUserByObjectId} from "../../../lib/controllers/user-controller";
import {authMiddleware} from "../../../lib/middlewares/auth-middleware";
import {databaseMiddleware} from "../../../lib/middlewares/database-middleware";
import {ApiCodes, ApiError, dispatchMiddleware, makeApiHandler, makeDataResponse} from "../../../lib/utils/api-utils";

export default makeApiHandler(
    databaseMiddleware(
        authMiddleware(
            dispatchMiddleware({
                get: {
                    schema: z.object({}),
                    handler: async (req, res, {auth}) => {
                        if (auth) {
                            const userObjectId = auth.userObjectId;
                            const user = await getUserByObjectId(userObjectId, {profile_media: true});
                            if (user !== null) {
                                res.json(makeDataResponse(user));
                            } else {
                                throw new ApiError("User not found", ApiCodes.notFound);
                            }
                        } else {
                            throw new ApiError("Authentication required", ApiCodes.forbidden);
                        }
                    },
                },
            })
        )
    )
);
