import classnames from "classnames";
import React, {HTMLAttributes, PropsWithoutRef, ReactNode} from "react";
import {NavLink, NavLinkProps} from "react-router-dom";

import {Colors, Sizes} from "../../constants";

export interface TagProps<T> extends HTMLAttributes<T> {
    className?: string;
    size?: Sizes;
    color?: Colors;
    action?: boolean;
    children: ReactNode;
}

export function Tag({className, color, size, action, children, ...props}: TagProps<HTMLSpanElement>) {
    return (
        <span
            className={classnames("tag", className, {
                ...(size !== undefined && {[size]: size}),
                ...(color !== undefined && {[color]: color}),
                action: action,
            })}
            {...props}
        >
            {children}
        </span>
    );
}

export function NavTag({
    className,
    color,
    size,
    action,
    children,
    ...props
}: TagProps<HTMLAnchorElement> & PropsWithoutRef<NavLinkProps>) {
    return (
        <NavLink
            className={classnames("tag", className, {
                ...(size !== undefined && {[size]: size}),
                ...(color !== undefined && {[color]: color}),
                action: action,
            })}
            {...props}
        >
            {children}
        </NavLink>
    );
}

export function LinkTag({className, color, size, action, children, ...props}: TagProps<HTMLAnchorElement>) {
    return (
        <a
            className={classnames("tag", className, {
                ...(size !== undefined && {[size]: size}),
                ...(color !== undefined && {[color]: color}),
                action: action,
            })}
            {...props}
        >
            {children}
        </a>
    );
}

export interface TagsProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    size?: Sizes;
    combined?: boolean;
    children?: ReactNode;
}

export function Tags({className, size, combined, children, ...props}: TagsProps) {
    return (
        <div
            className={classnames("tags", className, {
                ...(size !== undefined && {[size]: size}),
                combined: combined,
            })}
            {...props}
        >
            {children}
        </div>
    );
}
