import {NextFunction, Request, Response} from "express";
import {v4 as uuid} from "uuid";

import {Logger} from "../utils/logger";

export function loggerMiddleware(logger: Logger) {
    return (req: Request, res: Response, next: NextFunction) => {
        const id = uuid();

        req.logger = logger;
        req.logger.info({
            id,
            state: "start",
            // resource
            url: req.originalUrl,
            method: req.method,
            protocol: req.protocol,
            // user
            ip: req.ip,
            agent: req.get("User-Agent") || "unknown",
        });
        res.on("finish", () => {
            req.logger.info({
                id,
                state: "end",
                // resource
                method: req.method,
                url: req.originalUrl,
                code: res.statusCode,
            });
        });

        next();
    };
}
