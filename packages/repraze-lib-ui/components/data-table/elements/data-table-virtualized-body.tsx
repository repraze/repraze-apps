import classnames from "classnames";
import React, {ComponentType, HTMLAttributes, useCallback} from "react";
import {useResizeDetector} from "react-resize-detector";
import {FixedSizeList as List, ListChildComponentProps} from "react-window";

import {getInnerTableWidth, isSmallerScreen} from "../data-table-utils";
import {DataTableView, useDataTableViewDetector} from "../views/data-table-view";
import {DataTableRow} from "./data-table-row";

export interface DataTableVirtualizedBodyProps<T> extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    view: DataTableView<T>;
    innerRowHeight?: number;
}

export function DataTableVirtualizedBody<T>({
    className,
    view,
    innerRowHeight,
    ...props
}: DataTableVirtualizedBodyProps<T>) {
    const {ref, width, height} = useResizeDetector({
        handleWidth: true,
        handleHeight: true,
        refreshMode: "debounce",
        refreshRate: 50,
    });
    const {columns, data} = useDataTableViewDetector({view});
    const innerWidth = getInnerTableWidth(columns, width);
    // const rowHeight = isSmallerScreen() ? 33 : 41;
    const rowHeight =
        innerRowHeight !== undefined
            ? isSmallerScreen()
                ? 8 + innerRowHeight + 1
                : 16 + innerRowHeight + 1
            : isSmallerScreen()
            ? 33
            : 41;

    const renderRow: ComponentType<ListChildComponentProps<T>> = useCallback(
        ({index, style}) => {
            const row = data[index];
            const {style: viewStyle, ...rowProps} = view.getRowProps(row);
            const rowStyle = viewStyle ? {...viewStyle, ...style} : style;
            return (
                <DataTableRow
                    data={row}
                    columns={columns}
                    even={index % 2 == 1}
                    first={index == 0}
                    last={index == data.length - 1}
                    style={rowStyle}
                    {...rowProps}
                />
            );
        },
        [view, columns, data]
    );

    return (
        <div className={classnames("data-table-body-container", className)} ref={ref} {...props}>
            <List
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
                height={height || 0}
                width={innerWidth}
                itemCount={data.length}
                itemSize={rowHeight}
            >
                {renderRow}
            </List>
        </div>
    );
}
