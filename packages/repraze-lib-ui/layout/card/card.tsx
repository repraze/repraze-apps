import classnames from "classnames";
import React, {ElementType, ReactNode} from "react";

import {AsPropsWithoutRef} from "../../props";

export interface CardProps {
    className?: string;
    children?: ReactNode;
}

export function Card<C extends ElementType = "div">({
    as,
    className,
    children,
    ...props
}: AsPropsWithoutRef<CardProps, C>) {
    const Component = as || "div";
    return (
        <Component className={classnames("card", className)} {...props}>
            {children}
        </Component>
    );
}

export function CardLeft<C extends ElementType = "div">({
    as,
    className,
    children,
    ...props
}: AsPropsWithoutRef<CardProps, C>) {
    const Component = as || "div";
    return (
        <Component className={classnames("card-left", className)} {...props}>
            {children}
        </Component>
    );
}

export function CardRight<C extends ElementType = "div">({
    as,
    className,
    children,
    ...props
}: AsPropsWithoutRef<CardProps, C>) {
    const Component = as || "div";
    return (
        <Component className={classnames("card-right", className)} {...props}>
            {children}
        </Component>
    );
}

export function CardContent<C extends ElementType = "div">({
    as,
    className,
    children,
    ...props
}: AsPropsWithoutRef<CardProps, C>) {
    const Component = as || "div";
    return (
        <Component className={classnames("card-content", className)} {...props}>
            {children}
        </Component>
    );
}
