import classnames from "classnames";
import React, {HTMLAttributes, ReactNode} from "react";

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    children?: ReactNode;
}

export function Grid({className, children, ...props}: GridProps) {
    return (
        <div className={classnames("grid", className)} {...props}>
            {children}
        </div>
    );
}

export interface GridCellProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    children?: ReactNode;
}

export function GridCell({className, children, ...props}: GridCellProps) {
    return (
        <div className={classnames("grid-cell", className)} {...props}>
            {children}
        </div>
    );
}
