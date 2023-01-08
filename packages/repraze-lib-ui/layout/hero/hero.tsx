import classnames from "classnames";
import React, {HTMLAttributes, ReactNode} from "react";

export interface HeroProps extends HTMLAttributes<HTMLElement> {
    className?: string;
    children?: ReactNode;
}

export function Hero({className, children, ...props}: HeroProps) {
    return (
        <section className={classnames("hero", className)} {...props}>
            {children}
        </section>
    );
}
