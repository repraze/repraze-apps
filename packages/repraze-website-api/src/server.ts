import {UserAndPassword} from "@repraze/website-lib/types/user";
import {Email, Name, Password, Username} from "@repraze/website-lib/types/user-basic";
import compression from "compression";
import cors from "cors";
import {default as express} from "express";
import helmet from "helmet";
import mongoose from "mongoose";

import {apiRouter} from "./api";
import {createUser, listUsers} from "./controllers/user-controller";
import {loggerMiddleware} from "./middlewares/logger-middleware";
import {mediasServiceRouter} from "./services/medias";
import {Logger, LoggerLevel} from "./utils/logger";
import {stdInput} from "./utils/std";

const logger = new Logger({level: LoggerLevel.INFO});
const app = express();

// middlewares
app.use(cors());
app.use(
    helmet({
        contentSecurityPolicy: false,
    })
);
app.use(compression());
app.use(loggerMiddleware(logger));

// routing
app.use("/api/v1", apiRouter);
app.use("/medias", mediasServiceRouter);

export async function connectDatabase() {
    const mongoURI = "mongodb://172.20.224.1/repraze"; // cat /etc/resolv.conf
    mongoose.set("strictQuery", true);
    mongoose.connection.on("error", (message) => logger.error(message));
    const connection = await mongoose.connect(mongoURI);
    logger.info("Database connected");
    return connection;
}

export async function setupServer() {
    // check an admin exists before launching server to prevent lockout
    const users = await listUsers();
    if (users.length === 0) {
        console.log("Creating new Admin");
        const user: UserAndPassword = {
            username: await stdInput("username", Username),
            name: await stdInput("name", Name),
            email: await stdInput("email", Email),
            password: await stdInput("password", Password),
            bio: "",
            profile_media_id: null,
        };
        await createUser(undefined, user);
    }
}

export async function startServer() {
    await new Promise<void>((res, rej) => {
        app.listen(3000, () => {
            res();
        });
    });
    logger.info("repraze-app running on port 3000");
}
