import classnames from "classnames";
import React, {TextareaHTMLAttributes, forwardRef} from "react";

import {Colors, Sizes} from "../../../constants";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    className?: string;
    size?: Sizes;
    color?: Colors;
    noResize?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
    {className, size, color, noResize, ...props}: TextareaProps,
    ref
) {
    return (
        <textarea
            className={classnames("textarea", className, {
                ...(size !== undefined && {[size]: size}),
                ...(color !== undefined && {[color]: color}),
                "no-resize": noResize,
            })}
            ref={ref}
            {...props}
        />
    );
});
