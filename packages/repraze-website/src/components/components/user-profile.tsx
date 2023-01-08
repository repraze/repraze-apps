import React, {ElementType} from "react";
import {Link} from "react-router-dom";

import {User} from "../../repraze-types/user";
import {Figure, FigureProps} from "../../repraze-ui-lib/components/figure/figure";
import {
    Profile,
    ProfilePicture,
    ProfilePictureProps,
    ProfileProps,
} from "../../repraze-ui-lib/components/profile/profile";
import {Sizes} from "../../repraze-ui-lib/constants";
import {AsPropsWithoutRef} from "../../repraze-ui-lib/props";

export interface UserProfileProps extends Omit<ProfileProps, "src" | "name" | "more"> {
    user: User;
    to: string;
}

export function UserProfile({user, size, ...props}: UserProfileProps) {
    let more: string | undefined = undefined;
    if (size === Sizes.Medium || size === Sizes.Large) {
        more = user.username;
    }

    return (
        <Profile
            as={Link}
            size={size}
            name={user.name}
            more={more}
            src={
                user.profile_media
                    ? `/medias/${user.profile_media.id}${user.profile_media?.extension}`
                    : "/public/default-profile.jpg"
            }
            {...props}
        />
    );
}

export interface UserProfilePictureProps extends Omit<ProfilePictureProps, "src"> {
    user: User;
}

export function UserProfilePicture({user, ...props}: UserProfilePictureProps) {
    return (
        <ProfilePicture
            src={
                user.profile_media
                    ? `/medias/${user.profile_media.id}${user.profile_media?.extension}`
                    : "/public/default-profile.jpg"
            }
            {...props}
        />
    );
}

export interface UserPictureProps extends FigureProps {
    user: User;
}

export function UserPicture({user, ...props}: UserPictureProps) {
    return (
        <Figure rounded {...props}>
            <img
                src={
                    user.profile_media
                        ? `/medias/${user.profile_media.id}${user.profile_media?.extension}`
                        : "/public/default-profile.jpg"
                }
            />
        </Figure>
    );
}

export interface UserPillProps {
    user: User;
}

export function UserPill<C extends ElementType = "span">({as, user}: AsPropsWithoutRef<UserPillProps, C>) {
    const Component = as || "span";
    return (
        <Component className="user-pill text-ellipsis">
            <UserPicture className="user-media" user={user} size={Sizes.Small} inline />
            <span className="user-info">{user.name}</span>
        </Component>
    );
}
