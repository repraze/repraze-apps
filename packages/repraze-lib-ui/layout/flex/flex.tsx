import classnames from "classnames";
import React, {HTMLAttributes, ReactNode} from "react";

export enum FlexDirection {
    Row = "row",
    RowReverse = "row-reverse",
    Column = "column",
    ColumnReverse = "column-reverse",
}

export interface FlexProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    direction: FlexDirection;
    children?: ReactNode;
}

export function Flex({className, direction, children, ...props}: FlexProps) {
    return (
        <div
            className={classnames("flex", className, {
                [direction]: direction,
            })}
            {...props}
        >
            {children}
        </div>
    );
}
