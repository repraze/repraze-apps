import {faLink} from "@fortawesome/free-solid-svg-icons";
import classnames from "classnames";
import React, {HTMLAttributes, PropsWithoutRef, ReactNode} from "react";
import {NavLink, NavLinkProps} from "react-router-dom";

import {Sizes} from "../../constants";
import {Icon} from "../icon/icon";

export interface TitleProps extends HTMLAttributes<HTMLHeadingElement> {
    className?: string;
    size: 1 | 2 | 3 | 4 | 5 | 6;
    subtitle?: boolean;
    children?: ReactNode;
}

export function Title({className, size, subtitle, children, ...props}: TitleProps) {
    const CustomTag = `h${size}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

    return (
        <CustomTag className={classnames(subtitle ? "subtitle" : "title", className)} {...props}>
            {children}
        </CustomTag>
    );
}

export interface TitleAnchorProps {
    className?: string;
    toId: string;
}

export function TitleAnchor({className, toId, ...props}: TitleAnchorProps) {
    //TODO: as prop?
    return (
        <a className={classnames("anchor", className)} href={`#${toId}`}>
            <Icon icon={faLink} fixedWidth size={Sizes.Small} />
        </a>
    );
}
