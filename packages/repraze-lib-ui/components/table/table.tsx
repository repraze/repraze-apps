import classnames from "classnames";
import React, {HTMLAttributes, ReactNode, TableHTMLAttributes} from "react";

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
    className?: string;
    expand?: boolean;
    children?: ReactNode;
}

export function Table({className, expand, children, ...props}: TableProps) {
    return (
        <table className={classnames("table", className, {expand: expand})} {...props}>
            {children}
        </table>
    );
}

export interface TableContainerProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    children?: ReactNode;
}

export function TableContainer({className, children, ...props}: TableContainerProps) {
    return (
        <div className={classnames("table-container", className)} {...props}>
            {children}
        </div>
    );
}
