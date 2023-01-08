import classnames from "classnames";
import React, {HTMLAttributes, ReactNode} from "react";
import {useResizeDetector} from "react-resize-detector";

import {getInnerTableWidth} from "../data-table-utils";
import {getScrollbarWidth} from "../data-table-utils";
import {DataTableView, useDataTableViewDetector} from "../views/data-table-view";

export interface DataTableHeadProps<T> extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    view: DataTableView<T>;
    children?: ReactNode;
}

export function DataTableHead<T>({className, view, children, ...props}: DataTableHeadProps<T>) {
    const {ref, width} = useResizeDetector<HTMLDivElement>({
        handleWidth: true,
        handleHeight: false,
        refreshMode: "debounce",
        refreshRate: 50,
    });
    const {columns} = useDataTableViewDetector({view});
    const innerWidth = getInnerTableWidth(columns, width);
    const scollbarWidth = getScrollbarWidth();
    return (
        <div className={classnames("data-table-head-container", className)} ref={ref} {...props}>
            <div
                className="data-table-head"
                style={{paddingRight: scollbarWidth, minWidth: `${innerWidth}px`, width: "100%"}}
            >
                {children}
            </div>
        </div>
    );
}
