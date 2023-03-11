import {Post} from "@repraze/website-lib/types/post";
import Link from "next/link";
import React, {Fragment, HTMLAttributes} from "react";

import {dateLongFormat, dateShortFormat, datetimeInputFormat} from "../../lib/utils/date-format";
import {UserPill} from "./user-profile";

export interface PostInfoProps extends HTMLAttributes<HTMLParagraphElement> {
    post: Post;
}

export function PostInfo({post, ...props}: PostInfoProps) {
    return (
        <p {...props}>
            {post.author_users && post.author_users.length > 0 && (
                <>
                    {post.author_users.map((user, index) => (
                        <Fragment key={user.username}>
                            <UserPill user={user} as={Link} href={`/users/${user.username}`} />
                            {index !== 0 ? ", " : ""}
                        </Fragment>
                    ))}
                    &nbsp;•&nbsp;
                </>
            )}
            {post.publish_date && (
                <>
                    <time dateTime={datetimeInputFormat(post.publish_date)} title={dateLongFormat(post.publish_date)}>
                        {dateShortFormat(post.publish_date)}
                    </time>
                    &nbsp;•&nbsp;
                </>
            )}
            <span>{"8 min read"}</span>
        </p>
    );
}
