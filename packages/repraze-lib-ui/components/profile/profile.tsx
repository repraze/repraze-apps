import classnames from "classnames";
import React, {ElementType, HTMLAttributes, ReactNode} from "react";

import {Sizes} from "../../constants";
import {AsPropsWithoutRef} from "../../props";

export type ProfileProps = {
    className?: string;
    src?: string;
    size?: Sizes;
    name: ReactNode;
    more?: ReactNode;
};

export function Profile<C extends ElementType = "div">({
    as,
    className,
    src,
    size,
    name,
    more,
    ...props
}: AsPropsWithoutRef<ProfileProps, C>) {
    const Component = as || "div";
    return (
        <Component
            className={classnames("profile", className, {
                ...(size !== undefined && {[size]: size}),
            })}
            {...props}
        >
            <ProfilePicture src={src} size={size} />
            <div className="profile-info">
                <div className="profile-name">{name}</div>
                {more && <div className="profile-more">{more}</div>}
            </div>
        </Component>
    );
}

export interface ProfilePictureProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    src?: string;
    size?: Sizes;
}

export function ProfilePicture({className, src, size, ...props}: ProfilePictureProps) {
    return (
        <div
            className={classnames("profile-picture", className, {
                ...(size !== undefined && {[size]: size}),
            })}
            {...props}
        >
            <img src={src} />
        </div>
    );
}
