import classnames from "classnames";
import React, {ElementType} from "react";

import {Sizes} from "../../constants";
import {AsPropsWithoutRef} from "../../props";

// 1 rem - match text
// 2 rem - normal 2 lines

// https://en.wikipedia.org/wiki/Aspect_ratio_%28image%29#Still_photography
export enum FigureRatios {
    // square
    R1By1 = "r1by1",
    // common ratios
    R5By4 = "r5by4",
    R4By3 = "r4by3",
    R3By2 = "r3by2",
    R5By3 = "r5by3",
    R16By9 = "r16by9",
    R3By1 = "r3by1",
    R2By1 = "r2by1",
    // rotated 90
    R4By5 = "r4by5",
    R3By4 = "r3by4",
    R2By3 = "r2by3",
    R3By5 = "r3by5",
    R9By16 = "r9by16",
    R1By3 = "r1by3",
    R1By2 = "r1by2",
}

export type FigureProps = {
    className?: string;
    rounded?: boolean;
    inline?: boolean;
    size?: Sizes;
    ratio?: FigureRatios;
};

export function Figure<C extends ElementType = "figure">({
    as,
    className,
    rounded,
    inline,
    size,
    ratio,
    ...props
}: AsPropsWithoutRef<FigureProps, C>) {
    const Component = as || "figure";
    return (
        <Component
            className={classnames("figure", className, {
                rounded: rounded,
                inline: inline,
                ...(size !== undefined && {[size]: size}),
                ...(ratio !== undefined && {[ratio]: ratio}),
            })}
            {...props}
        />
    );
}
