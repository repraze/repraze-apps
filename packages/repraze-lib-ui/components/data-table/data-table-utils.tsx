import {DataTableViewColumn} from "./views/data-table-view";

export const getScrollbarWidth = (() => {
    let scrollbarWidth = 0;
    let deviceRatio = window.devicePixelRatio;
    function refresh() {
        const dummy = document.createElement("div");
        dummy.style.visibility = "hidden";
        dummy.style.overflow = "scroll"; // forced scrollbar
        document.body.appendChild(dummy);
        scrollbarWidth = dummy.getBoundingClientRect().height;
        dummy.parentNode?.removeChild(dummy);
    }
    return function () {
        if (scrollbarWidth === 0 || deviceRatio !== window.devicePixelRatio) {
            refresh();
            deviceRatio = window.devicePixelRatio;
        }
        return scrollbarWidth;
    };
})();

const mediaMd = 768; // breakpoint
export function isSmallerScreen() {
    return window.innerWidth < mediaMd;
}

export function getInnerTableWidth<T>(columns: DataTableViewColumn<T>[], containerWidth?: number): number {
    const columnsWidth = columns.reduce((w, c) => w + c.width, 0);
    const scollbarWidth = getScrollbarWidth();
    return Math.max(columnsWidth + scollbarWidth, containerWidth || 0);
}
