import {faAngleDown, faAngleUp} from "@fortawesome/free-solid-svg-icons";
import classnames from "classnames";
import React, {
    InputHTMLAttributes,
    MouseEvent,
    forwardRef,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {Colors, Sizes} from "../../../constants";
import {setSelectValue} from "../../../utils/value-setter";
import {Dropdown, DropdownMenu, DropdownMenuItem, useDropdownController} from "../../dropdown/dropdown";
import {Icon} from "../../icon/icon";

export type SelectDropdownOption = DropdownMenuItem;

export interface SelectDropdownProps extends Omit<InputHTMLAttributes<HTMLSelectElement>, "size" | "children"> {
    className?: string;
    size?: Sizes;
    color?: Colors;
    right?: boolean;
    up?: boolean;
    options: SelectDropdownOption[];
    value?: string | number;
}

export const SelectDropdown = forwardRef<HTMLSelectElement, SelectDropdownProps>(function SelectDropdown(
    {className, size, color, right, up, options, value, style, ...props}: SelectDropdownProps,
    ref
) {
    const localRef = useRef<HTMLSelectElement | null>(null);
    const [focus, setFocus] = useState<boolean>(false);

    const {close, toggle, isOpen, ref: dropdownRef} = useDropdownController();

    useEffect(() => {
        if (localRef && localRef.current) {
            const select = localRef.current;

            function handleFocus() {
                setFocus(true);
                console.log("focus");
            }

            function handleBlur() {
                setFocus(false);
                console.log("blur");
            }

            // subscribe
            select.addEventListener("focus", handleFocus);
            select.addEventListener("blur", handleBlur);

            return () => {
                // unsubscribe
                select.removeEventListener("focus", handleFocus);
                select.removeEventListener("blur", handleBlur);
            };
        }
    }, [localRef, setFocus]);

    const handleClick = useCallback(
        (even: MouseEvent<HTMLDivElement>) => {
            if (localRef && localRef.current) {
                const select = localRef.current;
                if (even.target !== select) {
                    select.focus();
                    select.click();
                    console.log("click", select);
                }
            }
        },
        [localRef]
    );

    const handleItemClick = useCallback(
        (id: string | number) => {
            if (localRef && localRef.current) {
                const select = localRef.current;
                setSelectValue(select, id.toString());
            }
            close();
        },
        [localRef, close]
    );

    const valueToOption = useMemo(() => {
        return options.reduce<Record<string, SelectDropdownOption>>((mapping, option) => {
            mapping[option.id] = option;
            return mapping;
        }, {});
    }, [options]);

    const option = value !== undefined ? valueToOption[value] : undefined;

    return (
        <Dropdown
            ref={dropdownRef}
            className={classnames("select-dropdown", className, {
                ...(size !== undefined && {[size]: size}),
                ...(color !== undefined && {[color]: color}),
                focus: focus,
            })}
            style={style}
            open={isOpen}
            right={right}
            up={up}
            onClick={handleClick}
            menu={
                <DropdownMenu
                    items={options}
                    activeItemIds={value ? [value] : undefined}
                    onItemClick={handleItemClick}
                />
            }
        >
            <div className="select-dropdown-trigger" onClick={toggle}>
                {option !== undefined ? (
                    typeof option.label === "string" ? (
                        <span>{option.label}</span>
                    ) : (
                        option.label
                    )
                ) : undefined}
            </div>
            <div className="select-action">
                <Icon icon={isOpen ? faAngleUp : faAngleDown} />
            </div>
            <select
                ref={(instance) => {
                    localRef.current = instance;

                    if (typeof ref === "function") {
                        ref(instance);
                    } else if (ref && typeof ref === "object") {
                        ref.current = instance;
                    }
                }}
                className="select-dropdown-input"
                value={value}
                {...props}
            >
                {options?.map((o) => (
                    <option key={o.id} value={o.id}>
                        {o.id}
                    </option>
                ))}
            </select>
        </Dropdown>
    );
});
