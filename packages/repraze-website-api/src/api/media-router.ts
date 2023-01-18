import {SortType} from "@repraze/website-lib/types/api";
import {DocumentId} from "@repraze/website-lib/types/document";
import {Media, MediaSortFields} from "@repraze/website-lib/types/media";
import {MediaCategory} from "@repraze/website-lib/types/media-basic";
import {Request, Response, default as express} from "express";
import {readFile, unlink} from "fs/promises";
import multer from "multer";
import {parse} from "path";
import {z} from "zod";

import {
    MediaFilterParams,
    MediaPageParams,
    MediaSortParams,
    countMedias,
    createMedia,
    deleteMedia,
    getMedia,
    listMedias,
    updateMedia,
    updateMediaData,
} from "../controllers/media-controller";
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

export const mediasRouter = express.Router();

// request upload utils

const multerUpload = multer({
    dest: "upload-tmp/",
    limits: {fileSize: 10 * 1000 * 1000}, // limit to 10MB, mongo limit 16MB document
});

const multerUploadFiles = multerUpload.array("files", 1000);
const multerUploadFile = multerUpload.single("file");

async function uploadFiles(req: Request, res: Response) {
    return new Promise<Express.Multer.File[]>((resolve, reject) => {
        multerUploadFiles(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                reject(new ApiError(err.message, ApiCodes.badRequest));
            } else if (err) {
                reject(err);
            } else {
                const files = req.files;
                if (files !== undefined && Array.isArray(files)) {
                    resolve(files);
                } else {
                    resolve([]);
                }
            }
        });
    });
}

async function uploadFile(req: Request, res: Response) {
    return new Promise<Express.Multer.File | undefined>((resolve, reject) => {
        multerUploadFile(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                reject(new ApiError(err.message, ApiCodes.badRequest));
            } else if (err) {
                reject(err);
            } else {
                const file = req.file;
                if (file !== undefined) {
                    resolve(file);
                } else {
                    resolve(undefined);
                }
            }
        });
    });
}

// general

// list medias
mediasRouter.get(
    "/",
    endpointHandler(
        z.object({
            query: z.object({
                // pagination
                limit: z.preprocess(intQueryField, z.number().int().min(1).max(100).default(25)),
                skip: z.preprocess(intQueryField, z.number().int().min(0).default(0)),
                // filter
                public: z.optional(z.preprocess(booleanQueryField, z.boolean())),
                category: z.optional(MediaCategory),
                // sort
                sort: z.optional(z.preprocess(sortQueryField, z.object({field: MediaSortFields, type: SortType}))),
                // search
                search: z.optional(z.string().max(256)),
            }),
        }),
        async (req, res, next, args) => {
            // authenticated
            if (req.auth) {
                const filterParams: MediaFilterParams = {
                    public: args.query.public,
                    category: args.query.category,
                    search: args.query.search,
                };
                let sortParams: MediaSortParams = [{field: "last_edit_date", type: "desc"}];
                if (args.query.sort) {
                    sortParams = [args.query.sort];
                }
                const pageParams: MediaPageParams = {
                    limit: args.query.limit,
                    skip: args.query.skip,
                };

                const [medias, mediaCount] = await Promise.all([
                    listMedias(filterParams, sortParams, pageParams, {meta: !!req.auth}),
                    countMedias(filterParams),
                ]);
                const meta = {filter: filterParams, sort: sortParams, page: pageParams, count: mediaCount};
                res.json(makeDataResponse(medias, meta));
            } else {
                throw new ApiError("Authentication required", ApiCodes.forbidden);
            }
        }
    )
);

// bulk create new medias
mediasRouter.post(
    "/upload",
    endpointHandler(
        z.object({
            // empty
        }),
        async (req, res, next, args) => {
            if (req.auth) {
                const files = await uploadFiles(req, res);

                const medias: Media[] = [];

                const userObjectId = req.auth.userObjectId;

                for (const file of files) {
                    const mediaData = await readFile(file.path);
                    const {name: mediaName, ext: mediaExt} = parse(file.originalname);

                    const media = await createMedia(
                        userObjectId,
                        {
                            // fields
                            id: null,
                            title: mediaName,
                            summary: "",
                            mime_type: null,
                            extension: null,
                            category: null,
                            size: 0,
                            // visibility
                            public: false,
                        },
                        {
                            extension: mediaExt.toLowerCase(),
                            size: file.size,
                            data: mediaData,
                        },
                        {meta: !!req.auth}
                    );
                    file.size;
                    unlink(file.path); // delete tmp file
                    medias.push(media);
                }
                res.status(ApiCodes.created).json(makeDataResponse(medias));
            } else {
                throw new ApiError("Authentication required", ApiCodes.forbidden);
            }
        }
    )
);

// item

// get a media
mediasRouter.get(
    "/:id",
    endpointHandler(
        z.object({
            params: z.object({
                id: DocumentId,
            }),
        }),
        async (req, res, next, args) => {
            const mediaId = args.params.id;
            // unauthenticated defaults
            const filterParams: MediaFilterParams = {
                public: true, // can only view public posts
            };
            // authenticated
            if (req.auth) {
                filterParams.public = undefined;
            }
            const media = await getMedia(mediaId, filterParams, {meta: !!req.auth});
            if (media !== null) {
                res.json(makeDataResponse(media));
            } else {
                throw new ApiError("Media not found", ApiCodes.notFound);
            }
        }
    )
);

// update a media
mediasRouter.patch(
    "/:id",
    endpointHandler(
        z.object({
            params: z.object({
                id: DocumentId,
            }),
            body: Media,
        }),
        async (req, res, next, args) => {
            if (req.auth) {
                const mediaId = args.params.id;
                const mediaData = args.body;
                const userObjectId = req.auth.userObjectId;
                const media = await updateMedia(mediaId, userObjectId, mediaData, {meta: !!req.auth});
                if (media !== null) {
                    res.json(makeDataResponse(media));
                } else {
                    throw new ApiError("Media not found", ApiCodes.notFound);
                }
            } else {
                throw new ApiError("Authentication required", ApiCodes.forbidden);
            }
        }
    )
);

// update a media data through upload
mediasRouter.post(
    "/:id/upload",
    endpointHandler(
        z.object({
            params: z.object({
                id: DocumentId,
            }),
        }),
        async (req, res, next, args) => {
            if (req.auth) {
                const mediaId = args.params.id;

                const file = await uploadFile(req, res);

                if (file) {
                    const userObjectId = req.auth.userObjectId;
                    const mediaData = await readFile(file.path);
                    const {ext: mediaExt} = parse(file.originalname);

                    const media = await updateMediaData(mediaId, userObjectId, {
                        mime_type: file.mimetype.toLowerCase(),
                        extension: mediaExt.toLowerCase(),
                        size: file.size,
                        data: mediaData,
                    });
                    if (media !== null) {
                        const mediaResponse = await getMedia(mediaId, undefined, {meta: !!req.auth});
                        if (mediaResponse !== null) {
                            res.json(makeDataResponse(mediaResponse));
                        } else {
                            throw new ApiError("Media not found", ApiCodes.notFound);
                        }
                    } else {
                        throw new ApiError("Media not found", ApiCodes.notFound);
                    }
                } else {
                    throw new ApiError("Media upload file not required", ApiCodes.badRequest);
                }
            } else {
                throw new ApiError("Authentication required", ApiCodes.forbidden);
            }
        }
    )
);

// remove a media
mediasRouter.delete(
    "/:id",
    endpointHandler(
        z.object({
            params: z.object({
                id: DocumentId,
            }),
        }),
        async (req, res, next, args) => {
            if (req.auth) {
                const mediaId = args.params.id;
                const media = await deleteMedia(mediaId, {meta: !!req.auth});
                if (media !== null) {
                    res.json(makeStatusResponse("Media deleted"));
                } else {
                    throw new ApiError("Media not found", ApiCodes.notFound);
                }
            } else {
                throw new ApiError("Authentication required", ApiCodes.forbidden);
            }
        }
    )
);
