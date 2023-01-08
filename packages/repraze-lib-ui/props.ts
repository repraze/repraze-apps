import {ComponentPropsWithRef, ComponentPropsWithoutRef, ElementType} from "react";

export type AsPropsWithoutRef<MainProps, C extends ElementType> = {
    as?: C;
} & MainProps &
    Omit<ComponentPropsWithoutRef<C>, keyof MainProps>;

export type AsPropsWithRef<MainProps, C extends ElementType> = {
    as?: C;
} & MainProps &
    Omit<ComponentPropsWithRef<C>, keyof MainProps>;
