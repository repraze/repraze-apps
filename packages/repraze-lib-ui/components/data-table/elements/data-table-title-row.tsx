import classnames from "classnames";
import React, {ReactNode} from "react";

import {DataTableView, DataTableViewColumn, useDataTableViewDetector} from "../views/data-table-view";
import {DataTableRow} from "./data-table-row";

export interface DataTableTitleRow<T> {
    className?: string;
    view: DataTableView<T>;
    titles?: {[K: string]: ReactNode};
}

export function DataTableTitleRow<T>({className, view, titles, ...props}: DataTableTitleRow<T>) {
    const {columns} = useDataTableViewDetector<T>({view});
    const titleColumns = columns.map<DataTableViewColumn<undefined>>((column) => ({
        ...column,
        cell: () => (titles && column.id in titles ? titles[column.id] : column.id),
        cellProps: () => ({}),
        rawCell: () => undefined,
    }));
    return (
        <DataTableRow
            className={classnames("data-table-title-row", className)}
            columns={titleColumns}
            data={undefined}
            head
            {...props}
        />
    );
}
