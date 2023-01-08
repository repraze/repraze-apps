import {z} from "zod";

import {authMiddleware} from "../../../../lib/middlewares/auth-middleware";
import {dispatchMiddleware, makeApiHandler} from "../../../../lib/utils/api-utils";

export default makeApiHandler(
    authMiddleware(
        dispatchMiddleware({
            get: {
                schema: z.object({}),
                handler: (req, res, data) => {
                    data.auth;
                    res.json({auth: data.auth});
                },
            },
        })
    )
);
