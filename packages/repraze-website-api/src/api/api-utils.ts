import {NextFunction, Request, Response} from "express";
import {ZodError, z} from "zod";

export const enum ApiCodes {
    // Successful codes
    ok = 200,
    created = 201,
    accepted = 202,
    /**
     * server processed the request successfully, but there's nothing to return
     */
    noContent = 204,

    // Client error codes
    /**
     * request was not understood, malformed request syntax, etc
     */
    badRequest = 400,
    /**
     * authentication is required, but not provided
     */
    unauthorized = 401,
    /**
     * authentication was provided, but request is not authorized for the resource
     */
    forbidden = 403,
    notFound = 404,

    // Server error codes
    internalError = 500,
    notImplemented = 501,
    badGateway = 502,
    unavailable = 503,
}

export class ApiError extends Error {
    code: ApiCodes;
    constructor(message: string, code: ApiCodes = ApiCodes.internalError) {
        super(message);
        this.name = "ApiError";
        this.code = code;

        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

// endpoint

export function endpointHandler<Schema extends z.AnyZodObject>(
    schema: Schema,
    handler: (req: Request, res: Response, next: NextFunction, args: z.infer<Schema>) => void | Promise<void>
) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsedArgs = await schema.parseAsync(req);
            await handler(req, res, next, parsedArgs);
        } catch (e) {
            if (e instanceof ZodError) {
                const firstIssue = e.issues[0];
                return next(
                    new ApiError(
                        `Bad API request, field "${firstIssue.path.join("->")}": ${firstIssue.message}`,
                        ApiCodes.badRequest
                    )
                );
            } else {
                return next(e);
            }
        }
    };
}

// export type ApiHandler<D, T = any> = (
//     req: NextApiRequest,
//     res: NextApiResponse<T>,
//     data: D
// ) => unknown | Promise<unknown>;

// export type ApiHandlerData = {logger: Logger};

// export function makeApiHandler<T = any>(handler: ApiHandler<ApiHandlerData, T>): NextApiHandler<T> {
//     const logger = new Logger({level: LoggerLevel.INFO}); // TODO: global?

//     return async (req: NextApiRequest, res: NextApiResponse) => {
//         try {
//             const handlerData = {logger: logger};
//             await handler(req, res, handlerData);
//         } catch (e) {
//             if (e instanceof ApiError) {
//                 logger.info(e.toString());
//                 res.status(e.code).json(makeStatusResponse(e.message));
//             } else {
//                 logger.error(e instanceof Error ? e.stack?.toString() : "" + e);
//                 res.status(ApiCodes.internalError).json(makeStatusResponse("Internal server error"));
//             }
//         }
//     };
// }

// export interface ApiRouteParams<Schema extends AnyZodObject, D, R = any> {
//     schema: Schema;
//     handler: ApiHandler<D, R>; // issue here
// }

// export interface ApiHandlerParams<
//     D,
//     GetSchema extends AnyZodObject,
//     PostSchema extends AnyZodObject,
//     PutSchema extends AnyZodObject,
//     DeleteSchema extends AnyZodObject,
//     AllSchema extends AnyZodObject,
//     GetR = any,
//     PostR = any,
//     PutR = any,
//     DeleteR = any,
//     AllR = any
// > {
//     get?: ApiRouteParams<GetSchema, {args: z.infer<GetSchema>} & D, GetR>;
//     post?: ApiRouteParams<PostSchema, {args: z.infer<PostSchema>} & D, PostR>;
//     put?: ApiRouteParams<PutSchema, {args: z.infer<PutSchema>} & D, PutR>;
//     delete?: ApiRouteParams<DeleteSchema, {args: z.infer<DeleteSchema>} & D, DeleteR>;
//     all?: ApiRouteParams<AllSchema, {args: z.infer<AllSchema>} & D, AllR>;
// }

// export function dispatchMiddleware<
//     D,
//     GetSchema extends AnyZodObject = any,
//     PostSchema extends AnyZodObject = any,
//     PutSchema extends AnyZodObject = any,
//     DeleteSchema extends AnyZodObject = any,
//     AllSchema extends AnyZodObject = any,
//     GetR = any,
//     PostR = any,
//     PutR = any,
//     DeleteR = any,
//     AllR = any
// >({
//     get,
//     post,
//     put,
//     delete: deleteRoute,
//     all,
// }: ApiHandlerParams<
//     D,
//     GetSchema,
//     PostSchema,
//     PutSchema,
//     DeleteSchema,
//     AllSchema,
//     GetR,
//     PostR,
//     PutR,
//     DeleteR,
//     AllR
// >): ApiHandler<D, any> {
//     return async (req: NextApiRequest, res: NextApiResponse, data: D) => {
//         const method = req.method;

//         const route = method ? {GET: get, POST: post, PUT: put, DELETE: deleteRoute}[method] || all : all;
//         if (!route) {
//             throw new ApiError("Route not found", ApiCodes.notFound);
//         } else {
//             try {
//                 const {schema, handler} = route;
//                 const parsedArgs = await schema.parseAsync(req);
//                 const argsData = {...data, args: parsedArgs};
//                 await handler(req, res, argsData);
//             } catch (e) {
//                 if (e instanceof ZodError) {
//                     const firstIssue = e.issues[0];
//                     throw new ApiError(
//                         `Bad API request, field "${firstIssue.path.join("->")}": ${firstIssue.message}`,
//                         ApiCodes.badRequest
//                     );
//                 } else {
//                     throw e;
//                 }
//             }
//         }
//     };
// }

// api responses

export function makeStatusResponse(message: string) {
    return {
        message,
    };
}

export function makeDataResponse<T extends object>(data: T, meta: {[field: string]: any} = {}) {
    return {
        meta: meta,
        data,
    };
}

// api schema type coercion

export function booleanQueryField(value: unknown) {
    // truthy by default
    if (value === "" || value === "true" || value === "1") {
        return true;
    }
    if (value === "false" || value === "0") {
        return false;
    }
    return value;
}

export function intQueryField(value: unknown) {
    if (typeof value === "string" && /^\d+$/.test(value)) {
        return parseInt(value, 10);
    }
    return value;
}

export function stringArrayQueryField(value: unknown) {
    if (typeof value === "string") {
        return value.split(",").map((t) => t.trim());
    }
    return value;
}

export function sortQueryField(value: unknown) {
    if (typeof value === "string") {
        if (value.startsWith("-")) {
            return {
                field: value.substring(1),
                type: "desc",
            };
        } else if (value.startsWith("+")) {
            return {
                field: value.substring(1),
                type: "asc",
            };
        } else {
            return {
                field: value,
                type: "asc",
            };
        }
    }
    return value;
}
