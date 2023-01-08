import classnames from "classnames";
import React, {HTMLAttributes, ReactNode} from "react";

export interface DataTableCellProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    head?: boolean;
    even?: boolean;
    first?: boolean;
    last?: boolean;
    children?: ReactNode;
}

export function DataTableCell({className, head, even, first, last, children, ...props}: DataTableCellProps) {
    return (
        <div
            className={classnames(head ? "data-table-th" : "data-table-td", className, {head, even, first, last})}
            {...props}
        >
            {children}
        </div>
    );
}
