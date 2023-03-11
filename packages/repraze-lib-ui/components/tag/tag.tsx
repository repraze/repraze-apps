import classnames from "classnames";
import React, {ElementType, HTMLAttributes, PropsWithoutRef, ReactNode} from "react";

import {Colors, Sizes} from "../../constants";
import {AsPropsWithoutRef} from "../../props";

export interface TagProps {
    className?: string;
    size?: Sizes;
    color?: Colors;
    action?: boolean;
    children: ReactNode;
}

export function Tag<C extends ElementType = "span">({
    as,
    className,
    color,
    size,
    action,
    children,
    ...props
}: AsPropsWithoutRef<TagProps, C>) {
    const Component = as || "span";
    return (
        <Component
            className={classnames("tag", className, {
                ...(size !== undefined && {[size]: size}),
                ...(color !== undefined && {[color]: color}),
                action: action,
            })}
            {...props}
        >
            {children}
        </Component>
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
