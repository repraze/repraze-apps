import {NextApiRequest, NextApiResponse} from "next";

import {AuthParams, decodeToken} from "../controllers/auth-controller";
import {ApiCodes, ApiError, ApiHandler} from "../utils/api-utils";

export type AuthData = {auth: AuthParams | null};

export function authMiddleware<D, T = any>(handler: ApiHandler<D & AuthData, T>): ApiHandler<D, T> {
    return async (req: NextApiRequest, res: NextApiResponse<T>, data: D) => {
        const authData: D & AuthData = {...data, auth: null};

        // Header auth with bearer
        const headerAuth = req.headers.authorization;
        // URL auth
        const urlAuth = req.query["access_token"];

        if (headerAuth) {
            const match = headerAuth.match(/^Bearer ([^\s]+)$/);
            if (match !== null && typeof match[1] === "string") {
                const token = match[1];
                authData.auth = await decodeToken(token);
            } else {
                throw new ApiError("Bad API authentication", ApiCodes.unauthorized);
            }
        } else if (urlAuth) {
            if (typeof urlAuth === "string") {
                authData.auth = await decodeToken(urlAuth);
            } else {
                throw new ApiError("Bad API authentication", ApiCodes.unauthorized);
            }
        }

        await handler(req, res, authData);
    };
}
