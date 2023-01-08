import classnames from "classnames";
import React, {HTMLAttributes, ReactNode} from "react";

export interface ContentProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    children?: ReactNode;
}

export function Content({className, children, ...props}: ContentProps) {
    return (
        <div className={classnames("content", className)} {...props}>
            {children}
        </div>
    );
}
