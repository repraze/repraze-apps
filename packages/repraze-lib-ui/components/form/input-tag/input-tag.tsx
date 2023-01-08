import {faTimes} from "@fortawesome/free-solid-svg-icons";
import classnames from "classnames";
import React, {
    ChangeEvent,
    FocusEventHandler,
    InputHTMLAttributes,
    KeyboardEvent,
    forwardRef,
    useCallback,
    useRef,
    useState,
} from "react";

import {Colors, Sizes} from "../../../constants";
import {Icon} from "../../icon/icon";
import {LinkTag, Tag, Tags} from "../../tag/tag";
import {Control, Field, Fields} from "../field/field";

export interface InputTagProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
    className?: string;
    size?: Sizes;
    color?: Colors;
    tagColor?: Colors;
    tags?: string[];
    onTagsChange?: (tags: string[]) => void;
}

export const InputTag = forwardRef<HTMLInputElement, InputTagProps>(function InputTag(
    {
        className,
        size,
        color,
        tagColor,
        onTagsChange,
        tags,
        id,
        name,
        placeholder,
        onFocus,
        onBlur,
        ...props
    }: InputTagProps,
    ref
) {
    const localRef = useRef<HTMLInputElement | null>(null);
    const [tag, setTag] = useState<string>("");
    const [focus, setFocus] = useState<boolean>(false);

    const handleClick = useCallback(() => {
        localRef.current?.focus();
    }, [localRef]);

    const handleChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const text = event.target.value;
            setTag(text);
        },
        [setTag]
    );

    const handleKeyDown = useCallback(
        (event: KeyboardEvent<HTMLInputElement>) => {
            const key = event.key;
            if (key === "Enter") {
                const cleanTag = tag.trim();
                if (onTagsChange && cleanTag !== "") {
                    onTagsChange(tags ? [...tags, cleanTag] : [cleanTag]);
                }
                setTag("");
            } else if (key === "Backspace") {
                if (onTagsChange && tag === "" && tags && tags.length > 0) {
                    onTagsChange(tags.slice(0, tags.length - 1));
                }
            }
        },
        [onTagsChange, tag, setTag, tags]
    );

    const handleRemove = useCallback(
        (index: number, event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
            // prevent handleClick
            event.stopPropagation();
            if (onTagsChange && tags && index < tags.length) {
                const nextTags = tags.slice();
                nextTags.splice(index, 1);
                onTagsChange(nextTags);
            }
            localRef.current?.focus();
        },
        [onTagsChange, localRef, tag, setTag, tags]
    );

    const handleFocus: FocusEventHandler<HTMLInputElement> = useCallback(
        (event) => {
            setFocus(true);
            if (onFocus) {
                onFocus(event);
            }
        },
        [focus, setFocus, onFocus]
    );

    const handleBlur: FocusEventHandler<HTMLInputElement> = useCallback(
        (event) => {
            setFocus(false);
            if (onBlur) {
                onBlur(event);
            }
        },
        [focus, setFocus, onBlur]
    );

    return (
        <div
            className={classnames("input-tag", className, {
                ...(size !== undefined && {[size]: size}),
                ...(color !== undefined && {[color]: color}),
                focus: focus,
            })}
            onClick={handleClick}
            {...props}
        >
            <Fields className="input-tag-fields" inline wrapped>
                {tags?.map((tag, index) => (
                    <Field key={tag + index}>
                        <Control>
                            <Tags combined>
                                <Tag size={size} color={tagColor}>
                                    {tag}
                                </Tag>
                                <LinkTag size={size} action onClick={handleRemove.bind(undefined, index)}>
                                    <Icon icon={faTimes} fixedWidth />
                                </LinkTag>
                            </Tags>
                        </Control>
                    </Field>
                ))}
                <Field expanded>
                    <Control expanded>
                        <input
                            className="input-tag-edit"
                            type="text"
                            ref={(instance) => {
                                localRef.current = instance;

                                if (typeof ref === "function") {
                                    ref(instance);
                                } else if (ref && typeof ref === "object") {
                                    ref.current = instance;
                                }
                            }}
                            id={id}
                            value={tag}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            name={name}
                            placeholder={placeholder}
                        />
                    </Control>
                </Field>
            </Fields>
        </div>
    );
});
