import classnames from "classnames";
import React from "react";

import {DataTableView, DataTableViewColumn, convertColumn, useDataTableViewDetector} from "../views/data-table-view";
import {DataTableRow} from "./data-table-row";

export interface DataTableInfoRowProps<T> {
    className?: string;
    view: DataTableView<T>;
}

export function DataTableInfoRow<T>({className, view, ...props}: DataTableInfoRowProps<T>) {
    const {columns, data} = useDataTableViewDetector<T>({view});
    const columnCount = columns.length;
    const rowCount = data.length;
    const columnWidth = columns.reduce((w, c) => w + c.width, 0);
    const infoColumn: DataTableViewColumn<undefined> = convertColumn({
        id: "info",
        cell: () => `Row ${rowCount}, Col ${columnCount}`,
        width: columnWidth,
        grow: 1,
    });
    return (
        <DataTableRow
            className={classnames("data-table-row-info", className)}
            columns={[infoColumn]}
            data={undefined}
            head
            {...props}
        />
    );
}
