import {
    faBold,
    faCode,
    faGripLines,
    faHeading,
    faItalic,
    faLink,
    faPlug,
    faStrikethrough,
    faTable,
} from "@fortawesome/free-solid-svg-icons";
import {Button} from "@repraze/lib-ui/components/button/button";
import {Control, Field, Fields} from "@repraze/lib-ui/components/form/field/field";
import {Textarea, TextareaProps} from "@repraze/lib-ui/components/form/textarea/textarea";
import {Icon} from "@repraze/lib-ui/components/icon/icon";
import {Sizes} from "@repraze/lib-ui/constants";
import {setTextAreaValue} from "@repraze/lib-ui/utils/value-setter";
import classnames from "classnames";
import React, {KeyboardEventHandler, MouseEvent, forwardRef, useCallback, useRef} from "react";

export type MarkdownEditorProps = TextareaProps;

interface Range {
    start: number;
    end: number;
}

interface Selection extends Range {
    direction: HTMLTextAreaElement["selectionDirection"];
}

function getSelection(target: HTMLTextAreaElement): Selection {
    return {
        start: target.selectionStart,
        end: target.selectionEnd,
        direction: target.selectionDirection,
    };
}

function setSelection(target: HTMLTextAreaElement, selection: Selection): void {
    target.selectionStart = selection.start;
    target.selectionEnd = selection.end;
    target.selectionDirection = selection.direction;
}

function rangeEmpty(r: Range) {
    return r.start === r.end;
}

function rangeOverlaps(a: Range, b: Range) {
    return !(a.end < b.start || b.end < a.start);
}

function pointOverlaps(p: number, b: Range) {
    return p >= b.start && p <= b.end;
}

interface Line extends Range {
    index: number;
    text: string;
}

function splitLines(value: string): Line[] {
    const rawLines = value.split("\n");
    const lines = [];
    let pos = 0;
    let line = "";
    let length = 0;
    for (let i = 0; i < rawLines.length; ++i) {
        line = rawLines[i];
        length = line.length;
        lines.push({
            index: i,
            start: pos,
            end: pos + length,
            text: line,
        });
        pos += length + 1; // include return
    }
    return lines;
}

function mergeLines(lines: Line[]): string {
    return lines.reduce((out, line, i) => out + (i !== 0 ? "\n" : "") + line.text, "");
}

function splitLineAt(l: Line, p: number): [string, string] {
    return [l.text.substring(0, p - l.start), l.text.substring(p - l.start, l.text.length)];
}

function getLineInRange(lines: Line[], r: Range): Line[] {
    const inRange: Line[] = [];
    for (let i = 0; i < lines.length; ++i) {
        const line = lines[i];
        if (rangeOverlaps(line, r)) {
            inRange.push(line);
        }
    }
    return inRange;
}

export const MarkdownEditor = forwardRef<HTMLTextAreaElement, MarkdownEditorProps>(function MarkdownEditor(
    {className, ...props}: MarkdownEditorProps,
    ref
) {
    const localRef = useRef<HTMLTextAreaElement | null>(null);

    const handleKeyDown = useCallback<KeyboardEventHandler<HTMLTextAreaElement>>(
        (event) => {
            console.log("handleKeyDown", event);

            const target = localRef.current;
            if (target) {
                if (event.key == "Enter") {
                    // keep indentation
                    const selection = getSelection(target);
                    if (rangeEmpty(selection)) {
                        event.preventDefault();

                        const endSelection: Selection = {...selection};
                        const value = target.value;
                        const lines = splitLines(value);

                        const selectedLines = getLineInRange(lines, selection);
                        if (selectedLines.length === 1) {
                            const selectedLine = selectedLines[0];
                            const match = selectedLine.text.match(/^\s*/g);
                            const spacing = match !== null ? match[0] || "" : "";
                            const [lineStart, lineEnd] = splitLineAt(selectedLine, selection.start);
                            selectedLine.text = lineStart;
                            lines.splice(selectedLine.index + 1, 0, {
                                index: -1,
                                start: -1,
                                end: -1,
                                text: spacing + lineEnd,
                            });
                            endSelection.start += spacing.length + 1;
                            endSelection.end += spacing.length + 1;
                        }

                        setTextAreaValue(target, mergeLines(lines));
                        setSelection(target, endSelection);
                        target.focus();
                    }
                } else if (event.key == "Tab") {
                    // allows tabs
                    event.preventDefault();

                    const selection = getSelection(target);
                    const endSelection: Selection = {...selection};
                    const value = target.value;
                    const lines = splitLines(value);
                    const selectedLines = getLineInRange(lines, selection);

                    if (rangeEmpty(selection)) {
                        // add simple tab
                        if (selectedLines.length === 1) {
                            const selectedLine = selectedLines[0];
                            const [lineStart, lineEnd] = splitLineAt(selectedLine, selection.start);
                            selectedLine.text = lineStart + "    " + lineEnd;
                            endSelection.start += 4;
                            endSelection.end += 4;
                        }
                    } else {
                        // move selected block
                        selectedLines.forEach((line, index) => {
                            if (index === 0) {
                                endSelection.start += 4;
                            }
                            endSelection.end += 4;
                            line.text = "    " + line.text;
                        });
                    }

                    setTextAreaValue(target, mergeLines(lines));
                    setSelection(target, endSelection);
                    target.focus();
                } else if (event.key == "Backspace") {
                    // remove indentation
                    const selection = getSelection(target);
                    if (rangeEmpty(selection)) {
                        const value = target.value;
                        const lines = splitLines(value);

                        const selectedLines = getLineInRange(lines, selection);
                        if (selectedLines.length === 1) {
                            const selectedLine = selectedLines[0];
                            const match = selectedLine.text.match(/^\s*/g);
                            const spacing = match !== null ? match[0] || "" : "";
                            // only when at non empty spacing position
                            if (spacing.length >= 4 && selectedLine.start + spacing.length === selection.start) {
                                event.preventDefault();
                                const [lineStart, lineEnd] = splitLineAt(selectedLine, selection.start);

                                const endSelection: Selection = {...selection};

                                selectedLine.text = lineStart.substring(4) + lineEnd;
                                endSelection.start -= 4;
                                endSelection.end -= 4;

                                setTextAreaValue(target, mergeLines(lines));
                                setSelection(target, endSelection);
                                target.focus();
                            }
                        }
                    }
                }
            }
        },
        [localRef]
    );

    const handleAddAtSelection = useCallback(
        (start: string, end: string, event: MouseEvent<HTMLButtonElement>) => {
            const target = localRef.current;
            if (target) {
                event.preventDefault();

                const selectStart = target.selectionStart;
                const selectEnd = target.selectionEnd;

                const value = target.value;
                const before = value.substring(0, selectStart);
                const selected = value.substring(selectStart, selectEnd);
                const after = value.substring(selectEnd, value.length);

                const modified = before + start + selected + end + after;

                setTextAreaValue(target, modified);

                target.selectionStart = selectStart + start.length;
                target.selectionEnd = selectEnd + start.length;

                target.focus();
            }
        },
        [localRef]
    );

    return (
        <div className={classnames("editor", className)}>
            <Fields inline wrapped>
                <Field>
                    <Control>
                        <Button size={Sizes.Small} onClick={handleAddAtSelection.bind(undefined, "**", "**")}>
                            <Icon icon={faBold} fixedWidth />
                        </Button>
                    </Control>
                    <Control>
                        <Button size={Sizes.Small} onClick={handleAddAtSelection.bind(undefined, "*", "*")}>
                            <Icon icon={faItalic} fixedWidth />
                        </Button>
                    </Control>
                    <Control>
                        <Button size={Sizes.Small} onClick={handleAddAtSelection.bind(undefined, "~~", "~~")}>
                            <Icon icon={faStrikethrough} fixedWidth />
                        </Button>
                    </Control>
                    <Control>
                        <Button
                            size={Sizes.Small}
                            onClick={handleAddAtSelection.bind(undefined, "\n\n----------\n\n", "")}
                        >
                            <Icon icon={faGripLines} fixedWidth />
                        </Button>
                    </Control>
                    <Control>
                        <Button size={Sizes.Small} onClick={handleAddAtSelection.bind(undefined, "# ", "")}>
                            <Icon icon={faHeading} fixedWidth />
                        </Button>
                    </Control>
                </Field>
                <Field>
                    <Control>
                        <Button size={Sizes.Small} onClick={handleAddAtSelection.bind(undefined, "<h1>", "</h1>")}>
                            <Icon icon={faTable} fixedWidth />
                        </Button>
                    </Control>
                    <Control>
                        <Button size={Sizes.Small} onClick={handleAddAtSelection.bind(undefined, "[", "](url)")}>
                            <Icon icon={faLink} fixedWidth />
                        </Button>
                    </Control>
                    <Control>
                        <Button
                            size={Sizes.Small}
                            onClick={handleAddAtSelection.bind(
                                undefined,
                                '``` lang numberLines=0 highlightLines={1,2-4} title="Title"\n',
                                "\n```"
                            )}
                        >
                            <Icon icon={faCode} fixedWidth />
                        </Button>
                    </Control>
                </Field>
                <Field>
                    <Control>
                        <Button size={Sizes.Small} onClick={handleAddAtSelection.bind(undefined, "<h1>", "</h1>")}>
                            <Icon icon={faPlug} fixedWidth />
                        </Button>
                    </Control>
                </Field>
            </Fields>
            <Textarea
                className="font-code"
                onKeyDown={handleKeyDown}
                ref={(instance) => {
                    localRef.current = instance;

                    if (typeof ref === "function") {
                        ref(instance);
                    } else if (ref && typeof ref === "object") {
                        ref.current = instance;
                    }
                }}
                autoCapitalize="off"
                autoComplete="off"
                spellCheck="false"
                {...props}
            ></Textarea>
        </div>
    );
});
