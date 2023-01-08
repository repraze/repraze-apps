import classnames from "classnames";
import React, {InputHTMLAttributes, forwardRef} from "react";

import {Colors, Sizes} from "../../../constants";

export type InputType =
    | "text"
    | "email"
    | "tel"
    | "password"
    | "number"
    | "search"
    | "color"
    | "date"
    | "time"
    | "datetime-local";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
    className?: string;
    size?: Sizes;
    color?: Colors;
    type?: InputType;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
    {className, size, color, type = "text", ...props}: InputProps,
    ref
) {
    return (
        <input
            ref={ref}
            className={classnames("input", className, {
                ...(size !== undefined && {[size]: size}),
                ...(color !== undefined && {[color]: color}),
            })}
            type={type}
            {...props}
        />
    );
});
