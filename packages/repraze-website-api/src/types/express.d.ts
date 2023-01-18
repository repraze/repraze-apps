import {AuthParams} from "../controllers/auth-controller";
import {Logger} from "../utils/logger";

// TODO: no overload

declare global {
    namespace Express {
        interface Request {
            logger: Logger;
            auth?: AuthParams;
        }
    }
}
