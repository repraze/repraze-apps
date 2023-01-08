import mongoose from "mongoose";
import {NextApiRequest, NextApiResponse} from "next";

import {ApiHandler} from "../utils/api-utils";

const MONGODB_URI = process.env.MONGODB_URI;

export type DatabaseData = {databaseConnection: typeof mongoose};

export function databaseMiddleware<D, T = any>(handler: ApiHandler<D & DatabaseData, T>): ApiHandler<D, T> {
    return async (req: NextApiRequest, res: NextApiResponse<T>, data: D) => {
        if (!MONGODB_URI) {
            throw new Error("Please define the MONGODB_URI environment variable inside .env");
        }

        // global to maintain connection
        if (!global.dbConnection) {
            mongoose.set("strictQuery", true);
            global.dbConnection = mongoose.connect(MONGODB_URI);
        }

        const databaseData = {...data, databaseConnection: await global.dbConnection};
        await handler(req, res, databaseData);
    };
}
