import {HTMLAttributes} from "react";

import {DataTableView, DataTableViewListener} from "./data-table-view";

export type DataTablePropsValue<T> = (row: T) => HTMLAttributes<HTMLDivElement>;

export class DataTablePropView<T> extends DataTableView<T> {
    private parent: DataTableView<T>;
    private props: DataTablePropsValue<T>;
    private parentListener: DataTableViewListener<T>;

    constructor(parent: DataTableView<T>, props: DataTablePropsValue<T> = () => ({})) {
        super();
        this.parent = parent;
        this.props = props;

        this.parentListener = () => {
            this.emitUpdate();
        };
        this.setParent(parent);
    }
    setParent(parent: DataTableView<T>) {
        // unregister previous
        this.parent.offUpdate(this.parentListener);

        this.parent = parent;
        this.parent.onUpdate(this.parentListener);

        this.emitUpdate();
    }
    setProps(props: DataTablePropsValue<T> = () => ({})) {
        this.props = props;
        this.emitUpdate();
    }
    getProps() {
        return this.props;
    }

    // data flow
    getColumns() {
        // columns same as parent
        return this.parent.getColumns();
    }
    getData(): T[] {
        // data same as parent
        return this.parent.getData();
    }
    getRowProps(row: T) {
        // merge props with parent
        return {...this.parent.getRowProps(row), ...this.props(row)};
    }
}
