import {Random} from "@repraze/lib-utils/random";
import {delay} from "@repraze/lib-utils/timing";
import {z} from "zod";

import {SCRYPT_DEFAULT_OPTION, compareHashPassword, encodeToken} from "../../../../../lib/controllers/auth-controller";
import {databaseMiddleware} from "../../../../../lib/middlewares/database-middleware";
import {UserModel} from "../../../../../lib/models/user-model";
import {ApiCodes, ApiError, dispatchMiddleware, makeApiHandler} from "../../../../../lib/utils/api-utils";

export default makeApiHandler(
    databaseMiddleware(
        dispatchMiddleware({
            post: {
                schema: z.object({
                    body: z.object({username: z.string(), password: z.string()}),
                }),
                handler: async (req, res, {args}) => {
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
                },
            },
        })
    )
);
