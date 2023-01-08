import classnames from "classnames";
import React, {HTMLAttributes, ReactNode} from "react";

export interface SectionProps extends HTMLAttributes<HTMLElement> {
    className?: string;
    children?: ReactNode;
}

export function Section({className, children, ...props}: SectionProps) {
    return (
        <section className={classnames("section", className)} {...props}>
            {children}
        </section>
    );
}
