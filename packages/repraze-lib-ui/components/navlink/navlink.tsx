import classnames from "classnames";
import Link, {LinkProps} from "next/link";
import {useRouter} from "next/router";
import React, {ReactNode} from "react";

import {removeSearchString} from "../../utils/url-utils";

export interface NavLinkProps extends LinkProps {
    children?: ReactNode;
    className?: string;
    activeClassName: string;
}

export function NavLink({children, className, activeClassName, ...props}: NavLinkProps) {
    const {asPath} = useRouter();
    const cleanPath = removeSearchString(asPath);

    const isActive = cleanPath === props.href || cleanPath === props.as;

    return (
        <Link className={classnames(className, {[activeClassName]: isActive})} {...props}>
            {children}
        </Link>
    );
}
