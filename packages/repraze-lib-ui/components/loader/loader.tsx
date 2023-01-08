import {IconProp} from "@fortawesome/fontawesome-svg-core";
import {faCircleNotch} from "@fortawesome/free-solid-svg-icons";
import classnames from "classnames";
import React from "react";

import {Icon, IconProps} from "../icon/icon";

export interface LoaderProps extends Omit<IconProps, "icon"> {
    icon?: IconProp;
    expanded?: boolean;
}

export function Loader({className, expanded, icon, ...props}: LoaderProps) {
    return (
        <Icon
            className={classnames("loader", className, {expanded: expanded})}
            icon={icon ?? faCircleNotch}
            title="Loading"
            spin
            {...props}
        />
    );
}
