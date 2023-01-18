import {z} from "zod";

import {Meta} from "./meta";
import {Password, UserBasic} from "./user-basic";

export const User = UserBasic.merge(Meta);
export type User = z.infer<typeof User>;

export const Users = z.array(User);
export type Users = z.infer<typeof Users>;

export const UserAndPassword = User.extend({
    // hidden
    password: Password,
});
export type UserAndPassword = z.infer<typeof UserAndPassword>;

export const UserSortFields = z.enum(["username", "name", "creation_date", "last_edit_date"]);
export type UserSortFields = z.infer<typeof UserSortFields>;
