import classnames from "classnames";
import React, {HTMLAttributes} from "react";

import {DataTableViewColumn} from "../views/data-table-view";
import {DataTableCell} from "./data-table-cell";

export interface DataTableRowProps<T> extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    data: T;
    columns: DataTableViewColumn<T>[];
    head?: boolean;
    even?: boolean;
    first?: boolean;
    last?: boolean;
}

export function DataTableRow<T>({className, data, columns, head, even, first, last, ...props}: DataTableRowProps<T>) {
    return (
        <div className={classnames("data-table-tr", className, {head, even, first, last})} {...props}>
            {columns.map((column, index) => {
                const cellProps = column.cellProps(data);
                return (
                    <DataTableCell
                        key={column.id}
                        style={column.style}
                        head={head}
                        even={index % 2 == 1}
                        first={index == 0}
                        last={index == columns.length - 1}
                        {...cellProps}
                    >
                        {column.cell(data)}
                    </DataTableCell>
                );
            })}
        </div>
    );
}
