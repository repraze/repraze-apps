import {randomBytes, scrypt, timingSafeEqual} from "crypto";
import jwt from "jsonwebtoken";
import {z} from "zod";

import {UserRecord} from "../models/user-record";

// Credentials handling

export interface ScryptHashParams {
    hashLength: number;
    saltLength: number;
    optionCost: number; // CPU/memory cost parameter. Must be a power of two greater than one.
    optionBlockSize: number; // Block size parameter.
    optionParallelization: number; // Parallelization parameter.
}

// scrypt settings
const SCRYPT_HASH_LENGTH = 64;
const SCRYPT_SALT_LENGTH = 24;
const SCRYPT_OPT_COST = 2 ** 14;
const SCRYPT_OPT_BLOCK_SIZE = 8;
const SCRYPT_OPT_PARALLELIZATION = 1;

export const SCRYPT_DEFAULT_OPTION: ScryptHashParams = Object.freeze({
    hashLength: SCRYPT_HASH_LENGTH,
    saltLength: SCRYPT_SALT_LENGTH,
    optionCost: SCRYPT_OPT_COST,
    optionBlockSize: SCRYPT_OPT_BLOCK_SIZE,
    optionParallelization: SCRYPT_OPT_PARALLELIZATION,
});

const BASE_64_DELIMITER = "."; // Not used in base 64, safe to split

function pack(args: Buffer[]): string {
    return args.map((a) => a.toString("base64")).join(BASE_64_DELIMITER);
}

function unpack(argString: string): Buffer[] {
    return argString.split(BASE_64_DELIMITER).map((s) => Buffer.from(s, "base64"));
}

async function scryptHash(password: string, salt: Buffer, params: ScryptHashParams): Promise<Buffer> {
    return new Promise<Buffer>((res, rej) => {
        scrypt(
            password,
            salt,
            params.hashLength,
            {
                cost: params.optionCost,
                blockSize: params.optionBlockSize,
                parallelization: params.optionParallelization,
            },
            (err, passwordHash) => {
                if (err) {
                    rej(err);
                }
                res(passwordHash);
            }
        );
    });
}

export async function hashPassword(password: string, params: ScryptHashParams): Promise<string> {
    const salt = randomBytes(params.saltLength);
    const passwordHash = await scryptHash(password, salt, params);
    return pack([salt, passwordHash]);
}

export async function compareHashPassword(
    passwordToCheck: string,
    hash: string,
    params: ScryptHashParams
): Promise<boolean> {
    try {
        const [salt, passwordHash] = unpack(hash);
        const passwordToCheckHash = await scryptHash(passwordToCheck, salt, params);
        return timingSafeEqual(passwordToCheckHash, passwordHash);
    } catch {
        return false;
    }
}

// Token handling

const AUTH_TOKEN_SECRET = "reprazetokenauth"; //TODO: move this to conf

export const AuthParams = z.object({
    userObjectId: z.string(),
    username: z.string(),
});

export type AuthParams = z.infer<typeof AuthParams>;

export async function encodeToken(user: UserRecord): Promise<string> {
    return new Promise<string>((res, rej) => {
        if (user._id !== undefined) {
            const payload: AuthParams = {userObjectId: user._id.toString(), username: user.username};
            jwt.sign(payload, AUTH_TOKEN_SECRET, {algorithm: "HS256"}, (err, token) => {
                if (err) {
                    rej(err);
                }
                if (token !== undefined) {
                    res(token);
                } else {
                    rej(new Error("Unexpected error during jwt sign, no error or token"));
                }
            });
        } else {
            rej(new Error("User record given does not have an object id"));
        }
    });
}

export async function decodeToken(token: string): Promise<AuthParams> {
    const decoded = await new Promise<any>((res, rej) => {
        jwt.verify(token, AUTH_TOKEN_SECRET, {algorithms: ["HS256"]}, (err, decoded) => {
            if (err) {
                rej(err);
            }
            if (decoded !== undefined) {
                res(decoded);
            } else {
                rej(new Error("Unexpected error during jwt verify, no error or decoded"));
            }
        });
    });
    return AuthParams.parseAsync(decoded);
}
