import classnames from "classnames";
import React, {HTMLAttributes, ReactNode} from "react";

export interface BoxProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    children?: ReactNode;
}

export function Box({className, children, ...props}: BoxProps) {
    return (
        <div className={classnames("box", className)} {...props}>
            {children}
        </div>
    );
}
