import {Colors, Sizes} from "@repraze/lib-ui/constants";
import classnames from "classnames";
import React, {InputHTMLAttributes} from "react";
import {Control, FieldPath, FieldValues, useController} from "react-hook-form";

import {datetimeInputFormat, datetimeInputParse} from "../../lib/utils/date-format";

export interface ControlledInputDatetimeProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
    className?: string;
    size?: Sizes;
    color?: Colors;

    name: TName;
    control: Control<TFieldValues>;
}

export function ControlledInputDatetime<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({className, size, color, name, control, ...props}: ControlledInputDatetimeProps<TFieldValues, TName>) {
    const {
        field: {onChange, onBlur, value, ref},
    } = useController({
        name,
        control,
    });

    return (
        <input
            type="datetime-local"
            ref={ref}
            className={classnames("input", className, {
                ...(size !== undefined && {[size]: size}),
                ...(color !== undefined && {[color]: color}),
            })}
            value={datetimeInputFormat(value)}
            onChange={(event) => {
                const value = event.target.value;

                if (value) {
                    onChange(datetimeInputParse(value));
                } else {
                    onChange(null);
                }
            }}
            onBlur={onBlur}
            {...props}
        />
    );
}
