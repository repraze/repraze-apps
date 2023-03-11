import {Autocomplete, AutocompleteSource} from "@repraze/lib-ui/components/autocomplete/autocomplete";
import {DropdownMenuItemId, useDropdownController} from "@repraze/lib-ui/components/dropdown/dropdown";
import {InputTag, InputTagProps} from "@repraze/lib-ui/components/form/input-tag/input-tag";
import {setInputValue} from "@repraze/lib-ui/utils/value-setter";
import classnames from "classnames";
import React, {FocusEventHandler, FormEventHandler, useCallback, useRef, useState} from "react";
import {Control, FieldPath, FieldValues, useController} from "react-hook-form";

export interface ControlledAutocompleteInputTagProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends InputTagProps {
    source: AutocompleteSource;
    name: TName;
    control: Control<TFieldValues>;
}

export function ControlledAutocompleteInputTag<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
    className,
    source,
    name,
    control,
    onInput,
    onFocus,
    ...props
}: ControlledAutocompleteInputTagProps<TFieldValues, TName>) {
    const localRef = useRef<HTMLInputElement | null>(null);
    const [query, setQuery] = useState<string>();
    const {
        field: {onChange, onBlur, value, ref},
    } = useController({
        name,
        control,
    });

    const {open, isOpen, ref: dropdownRef} = useDropdownController();

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
            }
            if (onInput) {
                onInput(event);
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
            }
            if (onFocus) {
                onFocus(event);
            }
        },
        [onFocus, localRef, query, setQuery, isOpen, open]
    );

    const handleItemClick = useCallback(
        (id: DropdownMenuItemId) => {
            if (localRef && localRef.current) {
                onChange([...value, id]);
                const input = localRef.current;
                setInputValue(input, "");
                input.focus();
            }
        },
        [localRef, onChange, value]
    );

    return (
        <Autocomplete
            ref={dropdownRef}
            className={classnames("input-tag-autocomplete", className)}
            source={source}
            query={query}
            activeItemIds={value ? value : undefined}
            onItemClick={handleItemClick}
            open={isOpen}
        >
            <InputTag
                ref={(instance) => {
                    localRef.current = instance;
                    ref(instance);
                }}
                {...props}
                tags={value}
                onTagsChange={onChange}
                onBlur={onBlur}
                onInput={handleInput}
                onFocus={handleFocus}
            />
        </Autocomplete>
    );
}
