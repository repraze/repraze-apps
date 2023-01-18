import {NextFunction, Request, Response, default as express} from "express";
import {z} from "zod";

import {authMiddleware} from "../middlewares/auth-middleware";
import {ApiCodes, ApiError, endpointHandler, makeStatusResponse} from "./api-utils";
import {authRouter} from "./auth-router";
import {mediasRouter} from "./media-router";
import {pagesRouter} from "./pages-router";
import {postsRouter} from "./posts-router";
import {projectsRouter} from "./projects-router";
import {userRouter} from "./user-router";
import {usersRouter} from "./users-router";

export const apiRouter = express.Router();

apiRouter.use(express.urlencoded({extended: true, limit: "50MB"})); // TODO: check limit
apiRouter.use(express.json({limit: "50MB"}));

// authentication
apiRouter.use(authMiddleware());

// welcome
apiRouter.get(
    "/",
    endpointHandler(z.object({}), (req, res) => {
        res.json(makeStatusResponse("Welcome to Repraze API!"));
    })
);

// authentication
apiRouter.use("/auth", authRouter);

// documents
apiRouter.use("/posts", postsRouter);
apiRouter.use("/pages", pagesRouter);
apiRouter.use("/projects", projectsRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/user", userRouter);
apiRouter.use("/medias", mediasRouter);

// not found
apiRouter.use(
    "/*",
    endpointHandler(z.object({}), (req, res) => {
        throw new ApiError("Endpoint not found", ApiCodes.notFound);
    })
);

// error handler
apiRouter.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    const logger = req.logger;
    if (err instanceof ApiError) {
        logger.info(err.toString());
        res.status(err.code).json(makeStatusResponse(err.message));
    } else {
        logger.error(err.stack?.toString() || err.toString());
        res.status(ApiCodes.internalError).json(makeStatusResponse("Internal server error"));
    }
});
