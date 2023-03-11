import {InputTag, InputTagProps} from "@repraze/lib-ui/components/form/input-tag/input-tag";
import React from "react";
import {Control, FieldPath, FieldValues, useController} from "react-hook-form";

export interface ControlledInputTagProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends InputTagProps {
    name: TName;
    control: Control<TFieldValues>;
}

export function ControlledInputTag<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({name, control, ...props}: ControlledInputTagProps<TFieldValues, TName>) {
    const {
        field: {onChange, onBlur, value, ref},
    } = useController({
        name,
        control,
    });

    return <InputTag ref={ref} {...props} tags={value} onTagsChange={onChange} onBlur={onBlur} />;
}
