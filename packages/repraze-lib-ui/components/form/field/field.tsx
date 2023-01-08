import {IconProp} from "@fortawesome/fontawesome-svg-core";
import classnames from "classnames";
import React, {HTMLAttributes, ReactNode} from "react";

import {Icon} from "../../icon/icon";

export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    expanded?: boolean;
    grouped?: boolean;
    centered?: boolean;
    right?: boolean;
    children?: ReactNode;
}

export function Field({className, expanded, grouped, centered, right, children, ...props}: FieldProps) {
    return (
        <div
            className={classnames("field", className, {
                expanded: expanded,
                grouped: grouped,
                centered: centered,
                right: right,
            })}
            {...props}
        >
            {children}
        </div>
    );
}

export interface ControlProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    leftIcon?: IconProp;
    rightIcon?: IconProp;
    expanded?: boolean;
    children?: ReactNode;
}

export function Control({className, leftIcon, rightIcon, expanded, children, ...props}: ControlProps) {
    return (
        <div
            className={classnames("control", className, {
                left: leftIcon,
                right: rightIcon,
                expanded: expanded,
            })}
            {...props}
        >
            {children}
            {leftIcon && <Icon icon={leftIcon} fixedWidth className="icon-left" />}
            {rightIcon && <Icon icon={rightIcon} fixedWidth className="icon-right" />}
        </div>
    );
}

export interface FieldsProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    inline?: boolean;
    wrapped?: boolean;
    children?: ReactNode;
}

export function Fields({className, inline, wrapped, children, ...props}: FieldsProps) {
    return (
        <div
            className={classnames("fields", className, {
                inline: inline,
                wrapped: wrapped,
            })}
            {...props}
        >
            {children}
        </div>
    );
}
