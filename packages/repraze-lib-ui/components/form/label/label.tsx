import classnames from "classnames";
import React, {LabelHTMLAttributes, ReactNode} from "react";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
    className?: string;
    children?: ReactNode;
}

export function Label({className, children, ...props}: LabelProps) {
    return (
        <label className={classnames("label", className)} {...props}>
            {children}
        </label>
    );
}

export function InputLabel({className, children, ...props}: LabelProps) {
    return (
        <label className={classnames("input-label", className)} {...props}>
            {children}
        </label>
    );
}
