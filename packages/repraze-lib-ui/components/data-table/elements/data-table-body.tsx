import classnames from "classnames";
import React, {HTMLAttributes} from "react";
import {useResizeDetector} from "react-resize-detector";

import {getInnerTableWidth} from "../data-table-utils";
import {DataTableView, useDataTableViewDetector} from "../views/data-table-view";
import {DataTableRow} from "./data-table-row";

export interface DataTableBodyProps<T> extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    view: DataTableView<T>;
}

export function DataTableBody<T>({className, view, ...props}: DataTableBodyProps<T>) {
    const {ref, width, height} = useResizeDetector({
        handleWidth: true,
        handleHeight: true,
        refreshMode: "debounce",
        refreshRate: 50,
    });
    const {columns, data} = useDataTableViewDetector({view});
    const innerWidth = getInnerTableWidth(columns, width);

    return (
        <div className={classnames("data-table-body-container", className)} ref={ref} {...props}>
            <div
                className="data-table-body"
                style={{
                    overflowX: "hidden",
                    overflowY: "scroll",
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    width: `${innerWidth}px`,
                    height: `${height}px`,
                }}
            >
                {data.map((row, index) => {
                    const rowProps = view.getRowProps(row);
                    return (
                        <DataTableRow
                            key={index}
                            data={row}
                            columns={columns}
                            even={index % 2 == 1}
                            first={index == 0}
                            last={index == data.length - 1}
                            {...rowProps}
                        />
                    );
                })}
            </div>
        </div>
    );
}
