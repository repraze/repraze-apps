import classnames from "classnames";
import React, {HTMLAttributes, ReactNode} from "react";

export interface FooterProps extends HTMLAttributes<HTMLElement> {
    className?: string;
    children?: ReactNode;
}

export function Footer({className, children, ...props}: FooterProps) {
    return (
        <footer className={classnames("footer", className)} {...props}>
            {children}
        </footer>
    );
}
