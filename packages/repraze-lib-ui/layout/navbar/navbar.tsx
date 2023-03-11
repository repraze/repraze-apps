import {faAngleDown} from "@fortawesome/free-solid-svg-icons";
import classnames from "classnames";
import React, {HTMLAttributes, ReactNode} from "react";

import {Icon} from "../../components/icon/icon";
import {MenuItems} from "../../components/menu/menu";
import {NavLink} from "../../components/navlink/navlink";

export interface NavbarProps extends HTMLAttributes<HTMLElement> {
    className?: string;
    children: ReactNode;
    fixed?: boolean;
}

export function Navbar({className, children, fixed, ...props}: NavbarProps) {
    return (
        <nav
            className={classnames("navbar", className, {
                fixed: fixed,
            })}
            {...props}
        >
            {children}
        </nav>
    );
}

export function NavbarItem() {
    return <div className="navbar-item"></div>;
}

export interface NavMenuProps {
    className?: string;
    dropdown?: boolean;
    items: MenuItems<HTMLAttributes<HTMLElement>>;
}

export function NavMenu({className, dropdown, items, ...props}: NavMenuProps) {
    return (
        <div className={classnames(dropdown ? "navbar-dropdown" : "navbar-menu", className)} {...props}>
            {items.map((item) => {
                const {className: itemClassName, ...itemProps} = {className: undefined, ...item.props};

                // has children
                if (item.items && item.items.length > 0) {
                    if (item.link) {
                        return (
                            <div className={classnames("navbar-item dropdown")} key={item.id}>
                                {item.link.startsWith("http") ? (
                                    <a
                                        className={classnames("navbar-link", itemClassName)}
                                        href={item.link}
                                        {...itemProps}
                                    >
                                        {item.label}
                                        <Icon className="navbar-link-icon" icon={faAngleDown} fixedWidth />
                                    </a>
                                ) : (
                                    <NavLink
                                        className="navbar-link"
                                        activeClassName="active"
                                        href={item.link}
                                        passHref
                                        legacyBehavior
                                    >
                                        <>
                                            {item.label}
                                            <Icon className="navbar-link-icon" icon={faAngleDown} fixedWidth />
                                        </>
                                    </NavLink>
                                )}
                                <NavMenu items={item.items} dropdown />
                            </div>
                        );
                    } else {
                        return (
                            <div className={classnames("navbar-item dropdown")} key={item.id}>
                                <a className={classnames("navbar-link", itemClassName)} {...itemProps}>
                                    {item.label}
                                    <Icon className="navbar-link-icon" icon={faAngleDown} fixedWidth />
                                </a>
                                <NavMenu items={item.items} dropdown />
                            </div>
                        );
                    }
                } else {
                    if (item.link) {
                        if (item.link.startsWith("http")) {
                            return (
                                <a
                                    className={classnames("navbar-item", itemClassName)}
                                    href={item.link}
                                    key={item.id}
                                    {...itemProps}
                                >
                                    {item.label}
                                </a>
                            );
                        } else {
                            return (
                                <NavLink
                                    className={classnames("navbar-item", itemClassName)}
                                    activeClassName="active"
                                    href={item.link}
                                    key={item.id}
                                    {...itemProps}
                                >
                                    {item.label}
                                </NavLink>
                            );
                        }
                    } else {
                        return (
                            <a className={classnames("navbar-item", itemClassName)} key={item.id} {...itemProps}>
                                {item.label}
                            </a>
                        );
                    }
                }
            })}
        </div>
    );
}
