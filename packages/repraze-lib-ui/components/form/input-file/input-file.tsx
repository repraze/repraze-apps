import classnames from "classnames";
import React, {
    DragEvent,
    InputHTMLAttributes,
    MouseEvent,
    ReactNode,
    forwardRef,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import {Colors, Sizes} from "../../../constants";
import {setInputFileValue} from "../../../utils/value-setter";
import {Button} from "../../button/button";
import {Control, Field} from "../field/field";

export const DEFAULT_PLACEHOLDER = "No file chosen";

export interface InputFileProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
    className?: string;
    size?: Sizes;
    color?: Colors;
    buttonColor?: Colors;
    dropper?: boolean;
    children?: ReactNode;
}

export const InputFile = forwardRef<HTMLInputElement, InputFileProps>(function InputFile(
    {
        className,
        size,
        color,
        buttonColor,
        dropper,
        multiple,
        placeholder,
        children = "Choose a file...",
        ...props
    }: InputFileProps,
    ref
) {
    const localRef = useRef<HTMLInputElement | null>(null);
    const [filename, setFilename] = useState<string>("");
    const [focus, setFocus] = useState<boolean>(false);

    const handleFiles = useCallback(
        (files: FileList) => {
            let filename = "";
            if (files.length > 0) {
                filename = Array.from(files)
                    .map((file) => file.name)
                    .join(", ");
            }
            if (!multiple === true && files.length > 1) {
                filename = "";
            }
            setFilename(filename);
        },
        [multiple, setFilename]
    );

    useEffect(() => {
        if (localRef && localRef.current) {
            const input = localRef.current;

            function handleChange() {
                const files = input.files;
                if (files) {
                    handleFiles(files);
                }
                console.log("change");
            }

            function handleFocus() {
                setFocus(true);
                console.log("focus");
            }

            function handleBlur() {
                setFocus(false);
                console.log("blur");
            }

            // subscribe
            input.addEventListener("change", handleChange);
            input.addEventListener("focus", handleFocus);
            input.addEventListener("blur", handleBlur);

            return () => {
                // unsubscribe
                input.removeEventListener("change", handleChange);
                input.removeEventListener("focus", handleFocus);
                input.removeEventListener("blur", handleBlur);
            };
        }
    }, [localRef, handleFiles, setFocus]);

    const handleClick = useCallback(
        (even: MouseEvent<HTMLDivElement>) => {
            if (localRef && localRef.current) {
                const input = localRef.current;
                if (even.target !== input) {
                    input.focus();
                    input.click();
                    console.log("click", input);
                }
            }
        },
        [localRef]
    );

    const handleDragOver = useCallback((event: DragEvent<HTMLInputElement>) => {
        event.preventDefault();
        event.stopPropagation();
    }, []);

    const handleDrop = useCallback(
        (event: DragEvent<HTMLInputElement>) => {
            event.preventDefault();
            event.stopPropagation();
            if (localRef && localRef.current) {
                const input = localRef.current;
                const files = event.dataTransfer.files;
                if (files) {
                    handleFiles(files);
                }
                setInputFileValue(input, files);
            }
        },
        [localRef, handleFiles]
    );

    return (
        <div
            className={classnames("input-file", className, {
                ...(size !== undefined && {[size]: size}),
                ...(color !== undefined && {[color]: color}),
                dropper: dropper,
                focus: focus,
            })}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            title={filename || (placeholder ?? DEFAULT_PLACEHOLDER)}
        >
            <input
                ref={(instance) => {
                    localRef.current = instance;

                    if (typeof ref === "function") {
                        ref(instance);
                    } else if (ref && typeof ref === "object") {
                        ref.current = instance;
                    }
                }}
                type="file"
                multiple={multiple}
                {...props}
            />
            <Field expanded>
                <Control expanded={dropper}>
                    <Button
                        className={classnames("input-file-handle", {focus})}
                        size={size}
                        color={color}
                        tabIndex={-1}
                    >
                        {children}
                    </Button>
                </Control>
                {!dropper && (
                    <Control expanded>
                        <span className="input-file-name">{filename || (placeholder ?? DEFAULT_PLACEHOLDER)}</span>
                    </Control>
                )}
            </Field>
        </div>
    );
});
