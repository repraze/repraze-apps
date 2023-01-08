import {ReactNode} from "react";

export interface MenuItem<ItemAttributes = unknown> {
    id: string;
    label: ReactNode;
    description?: string;
    link?: string;
    props?: ItemAttributes;
    items?: MenuItem<ItemAttributes>[];
}

export type MenuItems<ItemAttributes = unknown> = MenuItem<ItemAttributes>[];
