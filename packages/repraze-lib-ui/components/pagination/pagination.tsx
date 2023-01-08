import {faAngleLeft, faAngleRight} from "@fortawesome/free-solid-svg-icons";
import classnames from "classnames";
import React, {HTMLAttributes, ReactNode} from "react";

import {Icon} from "../icon/icon";

const ELLIPSIS = Symbol("ellipsis");

export interface PaginationProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    pageSelected: number; // current page
    pageRange?: number; // pages shown around current
    itemsCount: number;
    itemsCountPerPage?: number;
    label?: (page: number) => ReactNode;
    link?: (page: number) => string;
    onPageClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, page: number) => void;
}

export function Pagination({
    className,
    pageSelected,
    pageRange,
    itemsCount,
    itemsCountPerPage,
    label,
    link,
    onPageClick,
    ...props
}: PaginationProps) {
    const usedPageRange = Math.max(pageRange !== undefined ? pageRange : 1, 0);
    const usedItemsCountPerPage = Math.max(itemsCountPerPage !== undefined ? itemsCountPerPage : 10, 1);
    const usedLabel = label || ((page) => page + 1);
    const usedLink = link || ((page) => "#");

    const pageCount = Math.ceil(itemsCount / usedItemsCountPerPage);

    const pages: (number | typeof ELLIPSIS)[] = [];
    // always display first
    pages.push(0);
    // show ellipsis if page range disjoined from first
    if (pageSelected - usedPageRange - 1 > 0) {
        pages.push(ELLIPSIS);
    }
    // add pages around current page
    for (let i = pageSelected - usedPageRange; i <= pageSelected + usedPageRange; ++i) {
        if (i > 0 && i < pageCount - 1) {
            pages.push(i);
        }
    }
    // show ellipsis if page range disjoined from last
    if (pageSelected + usedPageRange + 1 < pageCount - 1) {
        pages.push(ELLIPSIS);
    }
    // always display last, if not same as first
    if (pageCount - 1 > 0) {
        pages.push(pageCount - 1);
    }
    // previous next
    const hasPrevious = pageSelected !== 0;
    const hasNext = pageSelected + 1 < pageCount;
    return (
        <div className={classnames("pagination", className)} {...props}>
            <a
                href={hasPrevious ? usedLink(pageSelected - 1) : undefined}
                className={classnames("pagination-previous", {disabled: !hasPrevious})}
                onClick={hasPrevious && onPageClick ? (event) => onPageClick(event, pageSelected - 1) : undefined}
            >
                <Icon icon={faAngleLeft} title="Previous" />
            </a>
            <a
                href={hasNext ? usedLink(pageSelected + 1) : undefined}
                className={classnames("pagination-next", {disabled: !hasNext})}
                onClick={hasNext && onPageClick ? (event) => onPageClick(event, pageSelected + 1) : undefined}
            >
                <Icon icon={faAngleRight} title="Next" />
            </a>
            <ul className="pagination-pages">
                {pages.map((p, pi) => (
                    <li key={pi}>
                        {p === ELLIPSIS ? (
                            <span className="pagination-ellipsis">&hellip;</span>
                        ) : (
                            <a
                                className={classnames("pagination-link", {current: p === pageSelected})}
                                href={usedLink(p)}
                                onClick={onPageClick ? (event) => onPageClick(event, p) : undefined}
                            >
                                {usedLabel(p)}
                            </a>
                        )}
                    </li>
                ))}
            </ul>
            <a></a>
        </div>
    );
}
