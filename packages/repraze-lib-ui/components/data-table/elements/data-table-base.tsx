import classnames from "classnames";
import React, {HTMLAttributes, ReactNode} from "react";

export interface DataTableProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    expand?: boolean;
    striped?: boolean;
    hoverable?: boolean;
    bordered?: boolean;
    children?: ReactNode;
}

export function DataTable({className, expand, striped, hoverable, bordered, children, ...props}: DataTableProps) {
    return (
        <div
            className={classnames("data-table", className, {
                expand: expand,
                striped: striped,
                hoverable: hoverable,
                bordered: bordered,
            })}
            {...props}
        >
            {children}
        </div>
    );
}
