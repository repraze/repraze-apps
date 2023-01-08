import {faAngleDown, faAngleUp} from "@fortawesome/free-solid-svg-icons";
import classnames from "classnames";
import React, {HTMLAttributes, ReactNode, useCallback, useState} from "react";
import {NavLink} from "react-router-dom";

import {Button} from "../../components/button/button";
import {Icon} from "../../components/icon/icon";
import {MenuItems} from "../../components/menu/menu";
import {Colors} from "../../constants";

export interface DrawerProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    children?: ReactNode;
    open?: boolean;
}

export function Drawer({className, children, open, ...props}: DrawerProps) {
    return (
        <div
            className={classnames("drawer", className, {
                open: open,
            })}
            {...props}
        >
            {children}
        </div>
    );
}

export interface DrawerMenuProps {
    className?: string;
    dropdown?: boolean;
    items: MenuItems<HTMLAttributes<HTMLElement>>;
    onItemClick?: (id: string) => void;
}

export function DrawerMenu({className, dropdown, items, onItemClick, ...props}: DrawerMenuProps) {
    const [show, setShow] = useState<{[key: string]: boolean}>({});
    const handleShow = useCallback(
        (id: string) => {
            const newShow = {...show};
            newShow[id] = id in newShow ? !newShow[id] : true;
            setShow(newShow);
        },
        [show, setShow]
    );
    const handleClick = useCallback(
        (id: string) => {
            if (onItemClick) {
                onItemClick(id);
            }
        },
        [onItemClick]
    );
    return (
        <div className={classnames(dropdown ? "drawer-dropdown" : "drawer-menu", className)} {...props}>
            {items.map((item) => {
                const {className: itemClassName, ...itemProps} = {className: undefined, ...item.props};

                // has children
                if (item.items && item.items.length > 0) {
                    const showDropdown = item.id in show ? show[item.id] : false;
                    if (item.link) {
                        return (
                            <div
                                className={classnames("drawer-item dropdown", itemClassName)}
                                key={item.id}
                                {...itemProps}
                            >
                                {item.link.startsWith("http") ? (
                                    <a
                                        className="drawer-link"
                                        href={item.link}
                                        onClick={handleClick.bind(undefined, item.id)}
                                    >
                                        <div className="drawer-link-label">{item.label}</div>
                                        <Button
                                            className="drawer-link-toggle"
                                            color={Colors.Transparent}
                                            onClick={() => handleShow(item.id)}
                                        >
                                            <Icon icon={showDropdown ? faAngleUp : faAngleDown} fixedWidth />
                                        </Button>
                                    </a>
                                ) : (
                                    <NavLink
                                        className="drawer-link"
                                        activeClassName="active"
                                        to={item.link}
                                        onClick={handleClick.bind(undefined, item.id)}
                                    >
                                        <div className="drawer-link-label">{item.label}</div>
                                        <Button
                                            className="drawer-link-toggle"
                                            color={Colors.Transparent}
                                            onClick={() => handleShow(item.id)}
                                        >
                                            <Icon icon={showDropdown ? faAngleUp : faAngleDown} fixedWidth />
                                        </Button>
                                    </NavLink>
                                )}
                                <DrawerMenu
                                    className={classnames({open: showDropdown})}
                                    items={item.items}
                                    dropdown
                                    onItemClick={onItemClick}
                                />
                            </div>
                        );
                    } else {
                        return (
                            <div
                                className={classnames("drawer-item dropdown", itemClassName)}
                                key={item.id}
                                {...itemProps}
                            >
                                <a className="drawer-link" onClick={handleClick.bind(undefined, item.id)}>
                                    <div className="drawer-link-label">{item.label}</div>
                                    <Button
                                        className="drawer-link-toggle"
                                        color={Colors.Transparent}
                                        onClick={() => handleShow(item.id)}
                                    >
                                        <Icon icon={showDropdown ? faAngleUp : faAngleDown} fixedWidth />
                                    </Button>
                                </a>
                                <DrawerMenu
                                    className={classnames({open: showDropdown})}
                                    items={item.items}
                                    dropdown
                                    onItemClick={onItemClick}
                                />
                            </div>
                        );
                    }
                } else {
                    if (item.link) {
                        if (item.link.startsWith("http")) {
                            return (
                                <a
                                    className={classnames("drawer-item", itemClassName)}
                                    href={item.link}
                                    key={item.id}
                                    onClick={handleClick.bind(undefined, item.id)}
                                    {...itemProps}
                                >
                                    {item.label}
                                </a>
                            );
                        } else {
                            return (
                                <NavLink
                                    className={classnames("drawer-item", itemClassName)}
                                    activeClassName="active"
                                    to={item.link}
                                    key={item.id}
                                    onClick={handleClick.bind(undefined, item.id)}
                                    {...itemProps}
                                >
                                    {item.label}
                                </NavLink>
                            );
                        }
                    } else {
                        return (
                            <a
                                className={classnames("drawer-item", itemClassName)}
                                key={item.id}
                                onClick={handleClick.bind(undefined, item.id)}
                                {...itemProps}
                            >
                                {item.label}
                            </a>
                        );
                    }
                }
            })}
        </div>
    );
}
