import {z} from "zod";

import {authMiddleware} from "../../../../lib/middlewares/auth-middleware";
import {databaseMiddleware} from "../../../../lib/middlewares/database-middleware";
import {ApiCodes, ApiError, dispatchMiddleware, makeApiHandler} from "../../../../lib/utils/api-utils";

export default makeApiHandler(
    databaseMiddleware(
        authMiddleware(
            dispatchMiddleware({
                get: {
                    schema: z.object({}),
                    handler: (req, res, {auth}) => {
                        if (auth) {
                            // TODO: use cookies
                        } else {
                            throw new ApiError("Authentication required", ApiCodes.forbidden);
                        }
                    },
                },
            })
        )
    )
);
