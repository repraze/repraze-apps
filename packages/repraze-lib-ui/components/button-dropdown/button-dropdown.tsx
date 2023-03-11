import classnames from "classnames";
import React, {ReactNode, useCallback} from "react";

import {AsPropsWithoutRef} from "../../props";
import {Button, ButtonProps} from "../button/button";
import {Dropdown, useDropdownController} from "../dropdown/dropdown";

export interface ButtonDropdownProps extends AsPropsWithoutRef<ButtonProps, "button"> {
    right?: boolean;
    up?: boolean;
    menu?: ReactNode;
    buttonProps?: ButtonProps;
}

export function ButtonDropdown({className, right, up, menu, children, ...props}: ButtonDropdownProps) {
    const {toggle, isOpen, ref: dropdownRef} = useDropdownController();

    const handleClick = useCallback(() => {
        toggle();
    }, [toggle]);

    return (
        <Dropdown
            ref={dropdownRef}
            className={classnames("button-dropdown", className)}
            open={isOpen}
            right={right}
            up={up}
            menu={menu}
        >
            <Button onClick={handleClick} {...props}>
                {children}
            </Button>
        </Dropdown>
    );
}
