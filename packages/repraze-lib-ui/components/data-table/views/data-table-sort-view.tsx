import {DataTableView, DataTableViewListener} from "./data-table-view";

export type DataTableSortFn = (cellA: any, cellB: any) => number;

export type DataTableSortsValue = {[K: string]: DataTableSortFn};

export class DataTableSortView<T> extends DataTableView<T> {
    private parent: DataTableView<T>;
    private sorts: DataTableSortsValue;
    private parentListener: DataTableViewListener<T>;

    constructor(parent: DataTableView<T>, sorts: DataTableSortsValue = {}) {
        super();
        this.parent = parent;
        this.sorts = sorts;

        this.parentListener = () => {
            this.sortParentData();
            this.emitUpdate();
        };
        this.setParent(parent);
    }
    setParent(parent: DataTableView<T>) {
        // unregister previous
        this.parent.offUpdate(this.parentListener);

        this.parent = parent;
        this.parent.onUpdate(this.parentListener);

        this.sortParentData();
        this.emitUpdate();
    }
    setSorts(sorts: DataTableSortsValue = {}) {
        this.sorts = sorts;
        this.sortParentData();
        this.emitUpdate();
    }
    getSorts() {
        return this.sorts;
    }

    // process
    private sortParentData() {
        const parentData = this.parent.getData();
        const columns = this.getColumns();
        const sorts = this.sorts;
        if (Object.keys(sorts).length > 0) {
            this.data = parentData.slice().sort((rowA, rowB) => {
                // always sort left to right
                for (let i = 0; i < columns.length; ++i) {
                    const {id, rawCell} = columns[i];
                    if (id in sorts) {
                        const cellDataA = rawCell(rowA);
                        const cellDataB = rawCell(rowB);
                        const sort = sorts[id];
                        const compare = sort(cellDataA, cellDataB);
                        if (compare !== 0) {
                            return compare;
                        }
                    }
                }
                return 0;
            });
        } else {
            // avoids unnecessary copy
            this.data = parentData;
        }
    }

    // data flow
    getColumns() {
        // columns same as parent
        return this.parent.getColumns();
    }
    getRowProps(row: T) {
        // row props same as parent
        return this.parent.getRowProps(row);
    }
}
