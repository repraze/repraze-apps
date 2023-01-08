import mongoose from "mongoose";

declare global {
    var dbConnection: Promise<typeof mongoose> | undefined;
}
