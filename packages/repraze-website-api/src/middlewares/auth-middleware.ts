import {NextFunction, Request, Response} from "express";

import {ApiCodes, ApiError} from "../api/api-utils";
import {decodeToken} from "../controllers/auth-controller";

export function authMiddleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Header auth with bearer
            const headerAuth = req.headers.authorization;
            // URL auth
            const urlAuth = req.query["access_token"];

            if (headerAuth) {
                const match = headerAuth.match(/^Bearer ([^\s]+)$/);
                if (match !== null && typeof match[1] === "string") {
                    const token = match[1];
                    req.auth = await decodeToken(token);
                } else {
                    throw new ApiError("Bad API authentication", ApiCodes.unauthorized);
                }
            } else if (urlAuth) {
                if (typeof urlAuth === "string") {
                    req.auth = await decodeToken(urlAuth);
                } else {
                    throw new ApiError("Bad API authentication", ApiCodes.unauthorized);
                }
            }
            next();
        } catch (e) {
            next(e);
        }
    };
}
