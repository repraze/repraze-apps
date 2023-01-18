import {Random} from "@repraze/lib-utils/random";
import {delay} from "@repraze/lib-utils/timing";
import {default as express} from "express";
import {z} from "zod";

import {SCRYPT_DEFAULT_OPTION, compareHashPassword, encodeToken, hashPassword} from "../controllers/auth-controller";
import {UserModel} from "../models/user-model";
import {ApiCodes, ApiError, endpointHandler} from "./api-utils";

export const authRouter = express.Router();

// only read cookies here

// login user with username / password
authRouter.post(
    "/login/basic",
    endpointHandler(
        z.object({
            body: z.object({username: z.string(), password: z.string()}),
        }),
        async (req, res, next, args) => {
            await delay(Random.default().float(250, 750)); // against timing attacks
            const result = await UserModel.findOne({username: args.body.username}).exec();
            if (result !== null) {
                if (await compareHashPassword(args.body.password, result.password, SCRYPT_DEFAULT_OPTION)) {
                    const token = await encodeToken(result);
                    res.json({
                        token,
                    });
                } else {
                    throw new ApiError("Username or password incorrect", ApiCodes.unauthorized);
                }
            } else {
                throw new ApiError("Username or password incorrect", ApiCodes.unauthorized);
            }
        }
    )
);

authRouter.get(
    "/refresh-token",
    endpointHandler(z.object({}), async (req, res, next, args) => {
        if (req.auth) {
            // TODO: read refresh cookie
            // res.cookie('refresh_token', refresh_token, { httpOnly: true, signed: true, maxAge: 432000000 }) // 5 days
        } else {
            throw new ApiError("Authentication required", ApiCodes.forbidden);
        }
    })
);
