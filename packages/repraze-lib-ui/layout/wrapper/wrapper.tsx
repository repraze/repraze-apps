import classnames from "classnames";
import React, {HTMLAttributes, ReactNode} from "react";

import {Widths} from "../../constants";

export interface WrapperProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    width?: Widths;
    children?: ReactNode;
}

export function Wrapper({className, width, children, ...props}: WrapperProps) {
    return (
        <div className={classnames("wrapper", className, {...(width !== undefined && {[width]: width})})} {...props}>
            {children}
        </div>
    );
}
