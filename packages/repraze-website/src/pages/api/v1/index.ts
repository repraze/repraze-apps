import {z} from "zod";

import {dispatchMiddleware, makeApiHandler, makeStatusResponse} from "../../../lib/utils/api-utils";

export default makeApiHandler(
    dispatchMiddleware({
        get: {
            schema: z.object({}),
            handler: (req, res) => {
                res.json(makeStatusResponse("Welcome to Repraze API!"));
            },
        },
    })
);
