import {CSSProperties, HTMLAttributes, ReactNode, useEffect, useState} from "react";

export interface DataTableViewDetectorProps<T> {
    view: DataTableView<T>;
}

export interface DataTableViewDetectorData<T> {
    columns: DataTableViewColumn<T>[];
    data: T[];
}

export type DataTableViewListener<T> = (columns: DataTableViewColumn<T>[], data: T[]) => void;

export function useDataTableViewDetector<T>({view}: DataTableViewDetectorProps<T>) {
    const [viewData, setViewData] = useState<DataTableViewDetectorData<T>>({
        columns: view.getColumns(),
        data: view.getData(),
    });

    useEffect(() => {
        const updateCallback: DataTableViewListener<T> = (columns, data) => {
            setViewData({columns, data});
        };
        view.onUpdate(updateCallback);
        return () => {
            view.offUpdate(updateCallback);
        };
    }, [view, setViewData]);

    return viewData;
}

export interface DataTableColumn<T> {
    id: string;

    cell: ((data: T) => ReactNode) | keyof T;
    cellProps?: ((data: T) => HTMLAttributes<HTMLDivElement>) | HTMLAttributes<HTMLDivElement>;
    rawCell?: ((data: T) => any) | keyof T;

    width: number; // width in px
    minWidth?: number;
    maxWidth?: number;
    grow?: number;
    shrink?: number;
    align?: "left" | "right" | "center";
}

export interface DataTableViewColumn<T> {
    id: string;

    cell: (data: T) => ReactNode;
    cellProps: (data: T) => HTMLAttributes<HTMLDivElement>;
    rawCell: (data: T) => any;

    width: number;
    style: CSSProperties;
}

export function convertColumn<T>({
    id,

    cell,
    cellProps,
    rawCell,

    width,
    minWidth,
    maxWidth,
    grow,
    shrink,
    align,
}: DataTableColumn<T>): DataTableViewColumn<T> {
    return {
        id: id,

        cell: typeof cell === "function" ? cell : (row: T) => row[cell],
        cellProps:
            cellProps !== undefined ? (typeof cellProps === "function" ? cellProps : () => cellProps) : () => ({}),
        rawCell:
            rawCell !== undefined
                ? typeof rawCell === "function"
                    ? rawCell
                    : (row: T) => row[rawCell]
                : typeof cell === "function"
                ? cell
                : (row: T) => row[cell],

        width: width,

        style: {
            width: `${width}px`,
            minWidth: `${minWidth}px`,
            maxWidth: `${maxWidth}px`,
            flex: `${grow || 0} ${shrink || 0} auto`,
            textAlign: align || "left",
            justifyContent: align
                ? {
                      left: "flex-start",
                      right: "flex-end",
                      center: "center",
                  }[align]
                : "flex-start",
        },
    };
}

export abstract class DataTableView<T> {
    protected columns: DataTableViewColumn<T>[];
    protected data: T[];
    private listeners: DataTableViewListener<T>[];

    constructor() {
        this.data = [];
        this.columns = [];
        this.listeners = [];
    }
    // event pipeline
    onUpdate(fn: DataTableViewListener<T>) {
        this.listeners.push(fn);
    }
    offUpdate(fn: DataTableViewListener<T>) {
        const index = this.listeners.indexOf(fn);
        if (index >= 0) {
            this.listeners.splice(index, 1);
        }
    }
    protected emitUpdate() {
        this.listeners.forEach((listener) => {
            listener(this.getColumns(), this.getData());
        });
    }
    // data flow
    getColumns(): DataTableViewColumn<T>[] {
        return this.columns;
    }
    getData(): T[] {
        return this.data;
    }
    getRowProps(row: T): HTMLAttributes<HTMLDivElement> {
        return {};
    }
}
