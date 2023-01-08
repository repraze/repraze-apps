import {IconProp} from "@fortawesome/fontawesome-svg-core";
import {faSort, faSortDown, faSortUp} from "@fortawesome/free-solid-svg-icons";
import classnames from "classnames";
import React, {ReactNode, useCallback, useState} from "react";

import {Icon} from "../../icon/icon";
import {DataTableSortFn, DataTableSortView} from "../views/data-table-sort-view";
import {DataTableView, DataTableViewColumn, convertColumn, useDataTableViewDetector} from "../views/data-table-view";
import {DataTableRow} from "./data-table-row";

export interface DataTableSortRowMethod {
    id: string;
    icon: IconProp;
    label?: string;
    apply?: DataTableSortFn;
}

export interface DataTableSortRowProps<T> {
    className?: string;
    view: DataTableView<T>;
    sortView: DataTableSortView<T>;
    titles?: {[K: string]: ReactNode};
    sorts?: {[K: string]: DataTableSortRowMethod[]};
}

export function DataTableSortRow<T>({className, view, sortView, titles, sorts, ...props}: DataTableSortRowProps<T>) {
    const {columns} = useDataTableViewDetector<T>({view});
    const [selectedIds, setSelectedId] = useState<{[K: string]: string | undefined}>({});
    const handleSort = useCallback(
        (columnId: string, currentId: string) => {
            const sortList = sorts && columnId in sorts ? sorts[columnId] : undefined;
            if (sortList) {
                const index = sortList.findIndex((s) => s.id === currentId);
                const nextIndex = index === -1 ? 0 : (index + 1) % sortList.length;
                const nextSort = sortList[nextIndex];

                if (nextSort.apply) {
                    // apply next sort
                    setSelectedId({[columnId]: nextSort.id});
                    sortView.setSorts({[columnId]: nextSort.apply});
                } else {
                    // no sort, remove sort
                    setSelectedId({});
                    sortView.setSorts({});
                }
            } else {
                // no list, remove sort
                setSelectedId({});
                sortView.setSorts({});
            }
        },
        [sortView, sorts, selectedIds, setSelectedId]
    );
    const sortColumns = columns.map<DataTableViewColumn<undefined>>((column) => {
        const columnId = column.id;
        const title = titles && columnId in titles ? titles[columnId] : columnId;
        const sortList = sorts && columnId in sorts ? sorts[columnId] : undefined;
        if (sortList && sortList.length > 0) {
            const sortId = selectedIds[columnId];
            const sort = sortId ? sortList.find((s) => s.id === sortId) : sortList[0];
            const usedId = sort ? sort.id : sortList[0].id;
            return {
                ...column,
                cell: () => (
                    <>
                        <span>{title}</span>
                        {sort && <Icon icon={sort.icon} title={sort.label} />}
                    </>
                ),
                cellProps: () => ({
                    className: "data-table-sort-th",
                    onClick: () => handleSort(columnId, usedId),
                }),
                rawCell: () => undefined,
            };
        } else {
            // fallback to regular title
            return {
                ...column,
                cell: () => title,
                cellProps: () => ({}),
                rawCell: () => undefined,
            };
        }
    });
    return (
        <DataTableRow
            className={classnames("data-table-sort-row", className)}
            columns={sortColumns}
            data={undefined}
            head
            {...props}
        />
    );
}

export function createDataTableStringSort(): DataTableSortRowMethod[] {
    return [
        {
            id: "str-none",
            icon: faSort,
            label: "None",
        },
        {
            id: "str-asc",
            icon: faSortDown,
            label: "Ascending",
            apply: (a, b) => a.toString().localeCompare(b.toString()),
        },
        {
            id: "str-desc",
            icon: faSortUp,
            label: "Descending",
            apply: (a, b) => b.toString().localeCompare(a.toString()),
        },
    ];
}

export function createDataTableNumberSort(): DataTableSortRowMethod[] {
    return [
        {
            id: "num-none",
            icon: faSort,
            label: "None",
        },
        {
            id: "num-asc",
            icon: faSortDown,
            label: "Ascending",
            apply: (a, b) => a - b,
        },
        {
            id: "num-desc",
            icon: faSortUp,
            label: "Descending",
            apply: (a, b) => b - a,
        },
    ];
}

export const createDataTableDateSort = createDataTableNumberSort; // alias
