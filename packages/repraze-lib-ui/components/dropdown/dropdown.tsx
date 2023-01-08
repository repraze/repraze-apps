import classnames from "classnames";
import React, {ElementType, HTMLAttributes, ReactNode, forwardRef, useCallback, useMemo, useRef, useState} from "react";

import {AsPropsWithoutRef} from "../../props";

export interface DropdownProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    open?: boolean;
    right?: boolean;
    up?: boolean;
    menu?: ReactNode;
    expandMenu?: boolean;
    children?: ReactNode;
}

export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(function Dropdown(
    {className, open, right, up, menu, expandMenu, children, ...props}: DropdownProps,
    ref
) {
    return (
        <div
            ref={ref}
            className={classnames("dropdown", className, {open: open, right: right, up: up, "expand-menu": expandMenu})}
            {...props}
        >
            <div className="dropdown-trigger">{children}</div>
            <div className="dropdown-menu">
                <div className="dropdown-content">{menu}</div>
            </div>
        </div>
    );
});

export type DropdownItemProps = {
    className?: string;
    active?: boolean;
    children?: ReactNode;
};

export function DropdownItem<C extends ElementType = "div">({
    as,
    className,
    active,
    ...props
}: AsPropsWithoutRef<DropdownItemProps, C>) {
    const Component = as || "div";
    return <Component className={classnames("dropdown-item", className, {active: active})} {...props} />;
}

export interface DropdownDividerProps extends HTMLAttributes<HTMLHRElement> {
    className?: string;
}

export function DropdownDivider({className, ...props}: DropdownDividerProps) {
    return <hr className={classnames("dropdown-divider", className)} {...props} />;
}

export interface DropdownHeadingProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export function DropdownHeading({className, ...props}: DropdownHeadingProps) {
    return <div className={classnames("dropdown-heading", className)} {...props} />;
}

export interface DropdownGroupProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export function DropdownGroup({className, ...props}: DropdownGroupProps) {
    return <div className={classnames("dropdown-group", className)} {...props} />;
}

export type DropdownMenuItemId = string | number;

export interface DropdownMenuItem {
    id: DropdownMenuItemId;
    label: ReactNode;
    description?: string;
}

export interface DropdownMenuProps {
    items: DropdownMenuItem[];
    activeItemIds?: DropdownMenuItemId[];
    onItemClick?: (id: DropdownMenuItemId) => void;
}

export function DropdownMenu({items, activeItemIds, onItemClick}: DropdownMenuProps) {
    const activeItemIdsSet = useMemo(() => new Set(activeItemIds), [activeItemIds]);

    const handleClick = useCallback(
        (id: string | number, event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
            // prevent cases of outside clicks
            event.stopPropagation();
            if (onItemClick) {
                onItemClick(id);
            }
        },
        [onItemClick]
    );

    return (
        <>
            {items.map((item) => (
                <DropdownItem
                    as="a"
                    key={item.id}
                    active={activeItemIdsSet.has(item.id)}
                    title={item.description}
                    onClick={handleClick.bind(undefined, item.id)}
                >
                    {item.label}
                </DropdownItem>
            ))}
        </>
    );
}

export function useDropdownController() {
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const [open, setOpen] = useState<boolean>(false);

    const openHandler = useCallback(() => {
        function handleClick(event: MouseEvent) {
            if (dropdownRef.current && event.target && !dropdownRef.current.contains(event.target as HTMLElement)) {
                document.removeEventListener("click", handleClick);
                window.removeEventListener("blur", handleBlur);
                setOpen(false);
            }
        }
        function handleBlur() {
            document.removeEventListener("click", handleClick);
            window.removeEventListener("blur", handleBlur);
            setOpen(false);
        }
        document.addEventListener("click", handleClick);
        window.addEventListener("blur", handleBlur);
        setOpen(true);
    }, [dropdownRef, open, setOpen]);

    const closeHandler = useCallback(() => {
        if (open) {
            setOpen(false);
        }
    }, [dropdownRef, open, setOpen]);

    const toggleHandler = useCallback(() => {
        if (open) {
            closeHandler();
        } else {
            openHandler();
        }
    }, [open, openHandler, closeHandler]);

    return {open: openHandler, close: closeHandler, toggle: toggleHandler, isOpen: open, ref: dropdownRef};
}
