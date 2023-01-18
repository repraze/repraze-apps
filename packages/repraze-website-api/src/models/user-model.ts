import {Schema, model, models} from "mongoose";

import {UserRecord} from "./user-record";

export const userSchema = new Schema<UserRecord>({
    // fields
    username: {type: String, required: true, unique: true, lowercase: true, trim: true, index: 1}, // public unique id
    name: {type: String, required: false, default: ""},
    email: {type: String, required: false, default: ""},
    bio: {type: String, required: false, default: ""},

    profile_media: {type: Schema.Types.ObjectId, ref: "Media", required: false},
    // hidden
    password: {type: String, required: true},

    // meta
    creation_date: {type: Date, required: true},
    creation_user: {type: Schema.Types.ObjectId, ref: "User", required: false},
    last_edit_date: {type: Date, required: true},
    last_edit_user: {type: Schema.Types.ObjectId, ref: "User", required: false},
    comment: {type: String, required: false, default: "", trim: true},
});

// indexes
userSchema.index({username: 1, type: 1});
userSchema.index({username: "text", name: "text"}); // search index

export const UserModel = models.User || model<UserRecord>("User", userSchema);
