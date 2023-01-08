import {faAngleDown} from "@fortawesome/free-solid-svg-icons";
import classnames from "classnames";
import React, {InputHTMLAttributes, ReactNode} from "react";

import {Colors, Sizes} from "../../../constants";
import {Icon} from "../../icon/icon";

export type SelectOption = {
    label: string;
    value: string | number;
};

export interface SelectProps extends Omit<InputHTMLAttributes<HTMLSelectElement>, "size"> {
    className?: string;
    size?: Sizes;
    color?: Colors;
    options?: SelectOption[];
}

export function Select({className, size, color, options, ...props}: SelectProps) {
    return (
        <div
            className={classnames("select", className, {
                ...(size !== undefined && {[size]: size}),
                ...(color !== undefined && {[color]: color}),
            })}
        >
            <select {...props}>
                {options?.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
            <div className="select-action">
                <Icon icon={faAngleDown} />
            </div>
        </div>
    );
}
