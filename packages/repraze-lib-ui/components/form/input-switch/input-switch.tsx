import classnames from "classnames";
import React, {InputHTMLAttributes, ReactNode, forwardRef} from "react";

import {Colors, Sizes} from "../../../constants";
import {InputLabel} from "../label/label";

export interface InputSwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
    className?: string;
    size?: Sizes;
    color?: Colors;
    children?: ReactNode;
}

export const InputSwitch = forwardRef<HTMLInputElement, InputSwitchProps>(
    ({className, size, color, children, ...props}, ref) => {
        return (
            <InputLabel>
                <input ref={ref} className="input-switch-checkbox" type="checkbox" {...props} />
                <div
                    className={classnames("input-switch", className, {
                        ...(size !== undefined && {[size]: size}),
                        ...(color !== undefined && {[color]: color}),
                    })}
                >
                    <div className="input-switch-handle" />
                </div>
                {children}
            </InputLabel>
        );
    }
);
