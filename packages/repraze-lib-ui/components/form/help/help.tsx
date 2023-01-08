import classnames from "classnames";
import React, {HTMLAttributes, ReactNode} from "react";

import {Colors} from "../../../constants";

export interface HelpProps extends HTMLAttributes<HTMLParagraphElement> {
    className?: string;
    color?: Colors;
    children?: ReactNode;
}

export function Help({className, color, children, ...props}: HelpProps) {
    return (
        <p
            className={classnames("help", className, {
                ...(color !== undefined && {[color]: color}),
            })}
            {...props}
        >
            {children}
        </p>
    );
}
