import classnames from "classnames";
import React, {ButtonHTMLAttributes, ElementType, ReactNode, forwardRef} from "react";

import {Colors, Sizes} from "../../constants";
import {AsPropsWithoutRef} from "../../props";

export interface ButtonProps {
    className?: string;
    size?: Sizes;
    color?: Colors;
    fullwidth?: boolean;
    children?: ReactNode;
}

export function Button<C extends ElementType = "button">({
    as,
    className,
    size,
    color,
    fullwidth,
    children,
    ...props
}: AsPropsWithoutRef<ButtonProps, C>) {
    const Component = as || "button";
    return (
        <Component
            className={classnames("button", className, {
                ...(size !== undefined && {[size]: size}),
                ...(color !== undefined && {[color]: color}),
                fullwidth: fullwidth,
            })}
            {...props}
        >
            {children}
        </Component>
    );
}
