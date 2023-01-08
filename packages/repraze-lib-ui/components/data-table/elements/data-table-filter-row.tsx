import {IconProp} from "@fortawesome/fontawesome-svg-core";
import {faSort, faSortDown, faSortUp} from "@fortawesome/free-solid-svg-icons";
import classnames from "classnames";
import React, {ChangeEventHandler, ComponentType, useCallback, useState} from "react";

import {Sizes} from "../../../constants";
import {Input, InputProps} from "../../form/input/input";
import {Select, SelectProps} from "../../form/select/select";
import {Icon} from "../../icon/icon";
import {DataTableFilterFn, DataTableFilterView} from "../views/data-table-filter-view";
import {DataTableView, DataTableViewColumn, convertColumn, useDataTableViewDetector} from "../views/data-table-view";
import {DataTableCellProps} from "./data-table-cell";
import {DataTableRow} from "./data-table-row";

export interface DataTableFilterCellProps extends DataTableCellProps {
    onFilter: (filter: DataTableFilterFn) => void;
}

export interface DataTableFilterRowProps<T> {
    className?: string;
    view: DataTableView<T>;
    filterView: DataTableFilterView<T>;
    filters?: {[K: string]: ComponentType<DataTableFilterCellProps>};
}

export function DataTableFilterRow<T>({className, view, filterView, filters, ...props}: DataTableFilterRowProps<T>) {
    const {columns} = useDataTableViewDetector<T>({view});
    const handleFilter = useCallback(
        (columnId: string, filter: DataTableFilterFn) => {
            const filters = filterView.getFilters();
            // not making a copy for speed
            filters[columnId] = filter;
            filterView.setFilters(filters);
        },
        [filterView, filters]
    );
    const filterColumns = columns.map<DataTableViewColumn<undefined>>((column) => ({
        ...column,
        cell: () => {
            const columnId = column.id;
            const FilterCell = filters && columnId in filters ? filters[columnId] : undefined;
            if (FilterCell) {
                return <FilterCell onFilter={(filter) => handleFilter(columnId, filter)} />;
            } else {
                return null;
            }
        },
        cellProps: () => ({
            className: "data-table-filter-th",
        }),
        rawCell: () => undefined,
    }));
    return (
        <DataTableRow
            className={classnames("data-table-filter-row", className)}
            columns={filterColumns}
            data={undefined}
            head
            {...props}
        />
    );
}

export interface DataTableStringFilterProps {
    exact?: boolean;
    sensitive?: boolean;
    inputProps?: InputProps;
}

export function createDataTableStringFilter({
    exact,
    sensitive,
    inputProps,
}: DataTableStringFilterProps = {}): ComponentType<DataTableFilterCellProps> {
    let method = (fv: string, rv: any) => false; // dummy
    if (exact) {
        if (sensitive) {
            method = (fv: string, rv: any) => !fv || "" + rv === fv;
        } else {
            method = (fv: string, rv: any) => !fv || ("" + rv).toLowerCase() === fv.toLowerCase();
        }
    } else {
        if (sensitive) {
            method = (fv: string, rv: any) => !fv || ("" + rv).includes(fv);
        } else {
            method = (fv: string, rv: any) => !fv || ("" + rv).toLowerCase().includes(fv.toLowerCase());
        }
    }
    return function ({onFilter}) {
        return (
            <Input
                type="text"
                size={Sizes.Small}
                onChange={(e) => onFilter(method.bind(undefined, e.target.value))}
                {...inputProps}
            />
        );
    };
}

export interface DataTableNumberFilterProps {
    min?: number;
    max?: number;
    step?: number;
    pattern?: string;
    inputProps?: InputProps;
}

export function createDataTableNumberFilter({
    min,
    max,
    step,
    pattern,
    inputProps,
}: DataTableNumberFilterProps = {}): ComponentType<DataTableFilterCellProps> {
    const method = (fv: number, cv: any) => !fv || cv == fv; // weak equality to match strings to numbers
    return function ({onFilter}) {
        return (
            <Input
                type="number"
                size={Sizes.Small}
                min={min}
                max={max}
                step={step}
                pattern={pattern}
                onChange={(e) => onFilter(method.bind(undefined, e.target.valueAsNumber))}
                {...inputProps}
            />
        );
    };
}

export type DataTableDateFilterProps = DataTableNumberFilterProps;

const DAY = 1000 * 60 * 60 * 24;
export function createDataTableDateFilter({
    min,
    max,
    step,
    pattern,
    inputProps,
}: DataTableDateFilterProps = {}): ComponentType<DataTableFilterCellProps> {
    function withinDay(fv: Date, cv: any) {
        if (cv !== undefined) {
            const b = fv.getTime();
            const t = "getTime" in cv ? cv.getTime() : cv;
            return t >= b && t < b + DAY;
        }
        return false;
    }
    const method = (fv: Date | undefined, cv: any) => fv === undefined || withinDay(fv, cv); // within 1 day
    return function ({onFilter}) {
        const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
            (event) => {
                const date = event.target.valueAsDate;
                if (date) {
                    // force beginning of local day
                    date.setMilliseconds(0);
                    date.setSeconds(0);
                    date.setMinutes(0);
                    date.setHours(0);
                    onFilter(method.bind(undefined, date));
                } else {
                    onFilter(method.bind(undefined, undefined));
                }
            },
            [method, onFilter]
        );
        return (
            <Input
                type="date"
                size={Sizes.Small}
                min={min}
                max={max}
                step={step}
                pattern={pattern}
                onChange={handleChange}
                {...inputProps}
            />
        );
    };
}

export interface DataTableNumberFilterProps {
    selectProps?: SelectProps;
}

enum BOOLEAN_FILTER_VALUE {
    All = "all",
    True = "true",
    False = "false",
}

export function createDataTableBooleanFilter({
    selectProps,
}: DataTableNumberFilterProps = {}): ComponentType<DataTableFilterCellProps> {
    const method = (fv: boolean | undefined, cv: any) => fv === undefined || fv == cv; // weak equality
    return function ({onFilter}) {
        const handleChange: ChangeEventHandler<HTMLSelectElement> = useCallback(
            (event) => {
                const value = event.target.value;
                if (value === BOOLEAN_FILTER_VALUE.All) {
                    onFilter(method.bind(undefined, undefined));
                } else if (value === BOOLEAN_FILTER_VALUE.True) {
                    onFilter(method.bind(undefined, true));
                } else {
                    onFilter(method.bind(undefined, false));
                }
            },
            [method, onFilter]
        );
        return (
            <Select
                size={Sizes.Small}
                options={[
                    {label: "All", value: BOOLEAN_FILTER_VALUE.All},
                    {label: "Yes", value: BOOLEAN_FILTER_VALUE.True},
                    {label: "No", value: BOOLEAN_FILTER_VALUE.False},
                ]}
                onChange={handleChange}
                {...selectProps}
            />
        );
    };
}
