import classnames from "classnames";
import React, {forwardRef, useEffect, useState} from "react";

import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuItemId,
    DropdownProps,
} from "../dropdown/dropdown";
import {Loader} from "../loader/loader";

export type AutocompleteOption = DropdownMenuItem;

export type AutocompleteSource = (query: string) => Promise<AutocompleteOption[]>;

export interface AutocompleteProps extends DropdownProps {
    className?: string;
    source: AutocompleteSource;
    query?: string;
    activeItemIds?: DropdownMenuItemId[];
    onItemClick?: (id: DropdownMenuItemId) => void;
}

export const Autocomplete = forwardRef<HTMLDivElement, AutocompleteProps>(function Autocomplete(
    {className, source, query, activeItemIds, onItemClick, children, ...props}: AutocompleteProps,
    ref
) {
    const [loading, setLoading] = useState<boolean>(false);
    const [options, setOptions] = useState<AutocompleteOption[]>([]);
    const hasOptions = options.length > 0;

    useEffect(() => {
        let cancelled = false;

        if (query !== undefined) {
            setLoading(true);
            setOptions([]);
            const originalQuery = query;
            source(query).then((options) => {
                // fix race, check the options are still relevant
                if (!cancelled && originalQuery === query) {
                    setLoading(false);
                    setOptions(options);
                }
            });
        }

        return () => {
            cancelled = true;
        };
    }, [source, query, setLoading, setOptions]);

    return (
        <Dropdown
            ref={ref}
            className={classnames("autocomplete", className)}
            {...props}
            menu={
                loading ? (
                    <DropdownItem>
                        <Loader />
                    </DropdownItem>
                ) : !hasOptions ? (
                    <DropdownItem>No Hits</DropdownItem>
                ) : (
                    <DropdownMenu items={options} activeItemIds={activeItemIds} onItemClick={onItemClick} />
                )
            }
            expandMenu
        >
            {children}
        </Dropdown>
    );
});
