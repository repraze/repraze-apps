import {default as express} from "express";
import {parse, resolve} from "path";

import {ApiCodes} from "../api/api-utils";
import {MediaFilterParams, getMediaData} from "../controllers/media-controller";

export const mediasServiceRouter = express.Router();

mediasServiceRouter.get("/:id", async (req, res) => {
    const {id} = req.params;
    const {name} = parse(id);

    const mediaFilter: MediaFilterParams = {public: true};

    // if authenticated, media can be private
    if (req.auth) {
        delete mediaFilter.public;
    }

    const mediaData = await getMediaData(name, mediaFilter);

    if (mediaData) {
        res.writeHead(200, {
            "Content-Type": mediaData.mime_type,
            "Content-Length": mediaData.data.length,
        });
        res.end(mediaData.data);
    } else {
        res.status(ApiCodes.notFound).send("Media not found");
    }
});
