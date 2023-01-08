import {parse} from "path";
import {z} from "zod";

import {MediaFilterParams, getMediaData} from "../../../lib/controllers/media-controller";
import {databaseMiddleware} from "../../../lib/middlewares/database-middleware";
import {ApiCodes, ApiError, dispatchMiddleware, makeApiHandler} from "../../../lib/utils/api-utils";

export const config = {
    api: {
        externalResolver: true, // suppress warning of rewrites
    },
};

export default makeApiHandler(
    databaseMiddleware(
        dispatchMiddleware({
            get: {
                schema: z.object({
                    query: z.object({
                        filename: z.string(), // not using doc id to allow extensions
                    }),
                }),
                handler: async (req, res, data) => {
                    const {filename} = data.args.query;
                    const {name, ext} = parse(filename);

                    const mediaFilter: MediaFilterParams = {public: true};
                    const mediaData = await getMediaData(name, mediaFilter);
                    if (mediaData) {
                        res.writeHead(200, {
                            "Content-Type": mediaData.mime_type,
                            "Content-Length": mediaData.data.length,
                        });
                        res.end(mediaData.data);
                    } else {
                        throw new ApiError("Media not found", ApiCodes.notFound);
                    }
                },
            },
        })
    )
);
