import classnames from "classnames";
import React, {FocusEventHandler, FormEventHandler, forwardRef, useCallback, useRef, useState} from "react";

import {setInputValue} from "../../../utils/value-setter";
import {Autocomplete, AutocompleteSource} from "../../autocomplete/autocomplete";
import {DropdownMenuItemId, useDropdownController} from "../../dropdown/dropdown";
import {Input, InputProps} from "../input/input";

export interface InputAutocompleteProps extends InputProps {
    source: AutocompleteSource;
}

export const InputAutocomplete = forwardRef<HTMLInputElement, InputAutocompleteProps>(function InputAutocomplete(
    {className, source, onInput, onFocus, ...props}: InputAutocompleteProps,
    ref
) {
    const localRef = useRef<HTMLInputElement | null>(null);
    const [query, setQuery] = useState<string>();

    const {open, close, isOpen, ref: dropdownRef} = useDropdownController();

    const handleInput: FormEventHandler<HTMLInputElement> = useCallback(
        (event) => {
            if (localRef && localRef.current) {
                const input = localRef.current;
                if (query !== input.value) {
                    setQuery(input.value);
                }
                if (!isOpen) {
                    open();
                }
                if (onInput) {
                    onInput(event);
                }
            }
        },
        [onInput, localRef, query, setQuery, isOpen, open]
    );

    const handleFocus: FocusEventHandler<HTMLInputElement> = useCallback(
        (event) => {
            if (localRef && localRef.current) {
                const input = localRef.current;
                if (query !== input.value) {
                    setQuery(input.value);
                }
                if (!isOpen) {
                    open();
                }
                if (onFocus) {
                    onFocus(event);
                }
            }
        },
        [onFocus, localRef, query, setQuery, isOpen, open]
    );

    const handleItemClick = useCallback(
        (id: DropdownMenuItemId) => {
            if (localRef && localRef.current) {
                const input = localRef.current;
                setInputValue(input, id.toString());
                input.focus();
            }
            close();
        },
        [localRef, close]
    );

    return (
        <Autocomplete
            ref={dropdownRef}
            className={classnames("input-autocomplete", className)}
            source={source}
            query={query}
            activeItemIds={query ? [query] : undefined}
            onItemClick={handleItemClick}
            open={isOpen}
        >
            <Input
                ref={(instance) => {
                    localRef.current = instance;

                    if (typeof ref === "function") {
                        ref(instance);
                    } else if (ref && typeof ref === "object") {
                        ref.current = instance;
                    }
                }}
                onInput={handleInput}
                onFocus={handleFocus}
                {...props}
            />
        </Autocomplete>
    );
});
