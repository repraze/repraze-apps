import {Schema, model, models} from "mongoose";

import {PostRecord} from "./post-record";

export const postSchema = new Schema<PostRecord>({
    // fields
    id: {type: String, required: true, unique: true, trim: true, index: 1}, // public unique id
    title: {type: String, required: true, trim: true},
    summary: {type: String, required: false, default: "", trim: true},
    content: {type: String, required: false, default: ""},
    tags: [{type: String, required: true, lowercase: true, trim: true}],
    author_users: [{type: Schema.Types.ObjectId, ref: "User", required: true}],
    featured_media: {type: Schema.Types.ObjectId, ref: "Media", required: false},

    // visibility
    public: {type: Boolean, required: true},
    listed: {type: Boolean, required: true},
    featured: {type: Boolean, required: true},
    publish_date: {type: Date, required: false}, // nullable

    // meta
    creation_date: {type: Date, required: true},
    creation_user: {type: Schema.Types.ObjectId, ref: "User", required: true},
    last_edit_date: {type: Date, required: true},
    last_edit_user: {type: Schema.Types.ObjectId, ref: "User", required: true},
    comment: {type: String, required: false, default: "", trim: true},
});

// indexes
postSchema.index({id: 1, type: 1});
postSchema.index({id: "text", title: "text"}); // search index

export const PostModel = models.Post || model<PostRecord>("Post", postSchema);
