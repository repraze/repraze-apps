import classnames from "classnames";
import React, {ButtonHTMLAttributes, ReactNode} from "react";

import {Colors, Sizes} from "../../constants";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string;
    size?: Sizes;
    color?: Colors;
    fullwidth?: boolean;
    children?: ReactNode;
}

export function Button({className, size, color, fullwidth, children, type = "button", ...props}: ButtonProps) {
    return (
        <button
            className={classnames("button", className, {
                ...(size !== undefined && {[size]: size}),
                ...(color !== undefined && {[color]: color}),
                fullwidth: fullwidth,
            })}
            type={type}
            {...props}
        >
            {children}
        </button>
    );
}
