import {IconProp, SizeProp, Transform} from "@fortawesome/fontawesome-svg-core";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import classnames from "classnames";
import React, {HTMLAttributes, ReactNode} from "react";

import {Colors, Sizes} from "../../constants";

function getFontAwesomeSize(size: Sizes): SizeProp | undefined {
    const map: {[key in Sizes]: SizeProp | undefined} = {
        [Sizes.Small]: "sm",
        [Sizes.Normal]: undefined,
        [Sizes.Medium]: "lg",
        [Sizes.Large]: "2x",
    };
    return map[size];
}

export interface IconProps extends HTMLAttributes<HTMLSpanElement> {
    className?: string;
    size?: Sizes;
    color?: Colors;
    icon: IconProp;

    spin?: boolean;
    pulse?: boolean;
    fixedWidth?: boolean;
    transform?: Transform;
}

export function Icon({className, size, color, icon, spin, pulse, fixedWidth, transform, ...props}: IconProps) {
    return (
        <span className={classnames("icon", className, {...(color !== undefined && {[color]: color})})} {...props}>
            <FontAwesomeIcon
                icon={icon}
                spin={spin}
                pulse={pulse}
                fixedWidth={fixedWidth}
                transform={transform}
                size={size !== undefined ? getFontAwesomeSize(size) : undefined}
            />
        </span>
    );
}

export interface IconsProps extends HTMLAttributes<HTMLSpanElement> {
    className?: string;
    children?: ReactNode;
}

export function Icons({className, children, ...props}: IconsProps) {
    return (
        <span className={classnames("icons fa-layers fa-fw", className)} {...props}>
            {children}
        </span>
    );
}
