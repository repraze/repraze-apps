import {Element, Properties, Root} from "hast";
import bash from "highlight.js/lib/languages/bash";
import c from "highlight.js/lib/languages/c";
import cpp from "highlight.js/lib/languages/cpp";
import csharp from "highlight.js/lib/languages/csharp";
import css from "highlight.js/lib/languages/css";
import js from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import markdown from "highlight.js/lib/languages/markdown";
import text from "highlight.js/lib/languages/plaintext";
import python from "highlight.js/lib/languages/python";
import scss from "highlight.js/lib/languages/scss";
import shell from "highlight.js/lib/languages/shell";
import ts from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
// import {refractor} from "refractor/lib/core";
// import jsx from "refractor/lang/jsx";
// import javascript from "refractor/lang/javascript";
// import css from "refractor/lang/css";
// import cssExtras from "refractor/lang/css-extras";
// import jsExtras from "refractor/lang/js-extras";
// import sql from "refractor/lang/sql";
// import typescript from "refractor/lang/typescript";
// import swift from "refractor/lang/swift";
// import objectivec from "refractor/lang/objectivec";
// import markdown from "refractor/lang/markdown";
// import json from "refractor/lang/json";
// refractor.register(jsx);
// refractor.register(json);
// refractor.register(typescript);
// refractor.register(javascript);
// refractor.register(css);
// refractor.register(cssExtras);
// refractor.register(jsExtras);
// refractor.register(sql);
// refractor.register(swift);
// refractor.register(objectivec);
// refractor.register(markdown);
// refractor.alias({jsx: ["js"]});
import {lowlight} from "lowlight/lib/core";
import parseNumericRange from "parse-numeric-range";
import {Processor, Transformer} from "unified";
import {visit as buggyVisit} from "unist-util-visit";

const visit = buggyVisit as any;

lowlight.registerLanguage("txt", text);
lowlight.registerLanguage("js", js);
lowlight.registerLanguage("ts", ts);
lowlight.registerLanguage("json", json);
lowlight.registerLanguage("xml", xml);
lowlight.registerLanguage("css", css);
lowlight.registerLanguage("scss", scss);
lowlight.registerAlias("scss", ["sass"]);
lowlight.registerLanguage("python", python);
lowlight.registerLanguage("bash", bash);
lowlight.registerLanguage("shell", shell);
lowlight.registerLanguage("c", c);
lowlight.registerLanguage("cpp", cpp);
lowlight.registerLanguage("csharp", csharp);
lowlight.registerLanguage("markdown", markdown);

const PREFIX = "sc-";

function arrayify<T>(value: T | T[]): T[] {
    if (!Array.isArray(value)) {
        return [value];
    }
    return value;
}

function isString(value: unknown): value is string {
    return typeof value === "string";
}

function getLanguage(node: Element, fallback: string): string {
    const classNames = node.properties ? arrayify(node.properties.className) : [];
    for (let i = 0; i < classNames.length; ++i) {
        const className = classNames[i];
        if (isString(className) && className.startsWith("language-")) {
            return className.slice(9).toLowerCase();
        }
    }
    return fallback;
}

const R_NUMBER_LINES = /(numberLines)/;
function getNumberLines(meta: string): boolean {
    const match = R_NUMBER_LINES.exec(meta);
    return match !== null;
}

const R_START_LINE = /numberLines=([\d]+)/;
function getStartLine(meta: string, fallback: number): number {
    const match = R_START_LINE.exec(meta);
    if (match !== null) {
        return parseInt(match[1], 10);
    }
    return fallback;
}

const R_LINE_HIGHLIGHT = /highlightLines={([\d,-]+)}/;
function getHighlightedLines(meta: string): Set<number> {
    const highlightedLines = new Set<number>();
    const match = R_LINE_HIGHLIGHT.exec(meta);
    if (match !== null) {
        parseNumericRange(match[1]).forEach(highlightedLines.add, highlightedLines);
    }
    return highlightedLines;
}

const R_TITLE = /title="([^\"]+)"/;
function getTitle(meta: string): string | null {
    const match = R_TITLE.exec(meta);
    if (match !== null) {
        return match[1];
    }
    return null;
}

function addNodeProperties(node: Element, properties: Properties) {
    if (node.properties === undefined) {
        node.properties = {};
    }
    // TODO: make generic?
    // className, only string supported
    if (properties.className) {
        node.properties.className = (node.properties.className ? arrayify(node.properties.className) : [])
            .concat(arrayify(properties.className))
            .filter(isString);
    }
}

type rehypeHighlightOptions = {
    prefix?: string;
    transformPreTagName?: string;
};

//export function rehypeHighlight(this: Processor, options?: rehypeHighlightOptions): Transformer<Root, Root> {
export function rehypeHighlight(
    this: Processor,
    {prefix, transformPreTagName}: rehypeHighlightOptions = {}
): Transformer<Root, Root> {
    const usedPrefix = prefix || PREFIX;
    const classCode = `${usedPrefix}ch`;
    const classCodeNumberLines = `${usedPrefix}number-lines`;
    const classCodeCollapse = `${usedPrefix}collapse`;
    const classLine = `${usedPrefix}line`;
    const classLineHighlight = `${usedPrefix}highlight`;

    // eslint-disable-next-line complexity
    return (tree) =>
        visit(tree, "element", (node: Element, index: number | null, parent: Root | Element | null) => {
            if (node.tagName === "code") {
                const rawCode =
                    node.children.length > 0 && node.children[0].type === "text" ? node.children[0].value : null;

                if (rawCode) {
                    if (parent && "tagName" in parent && parent.tagName === "pre") {
                        if (transformPreTagName) {
                            // transform parent for custom react rendering
                            parent.tagName = transformPreTagName;
                        }
                        addNodeProperties(parent, {className: classCode});

                        const meta = (node.data?.meta || "") as string;
                        let language = getLanguage(node, "text");
                        if (!lowlight.registered(language)) {
                            console.warn(`Refractor does not support "${language}", fallback to "text"`);
                            language = "text";
                        }
                        const title = getTitle(meta);
                        const numberLines = getNumberLines(meta);
                        const startLine = getStartLine(meta, 1);
                        const highlightedLines = getHighlightedLines(meta);

                        const options = {
                            prefix: usedPrefix,
                        };

                        if (numberLines) {
                            addNodeProperties(parent, {className: classCodeNumberLines});
                        }

                        const codeLines = rawCode.split(/\r?\n/g);
                        // remove last line if empty
                        if (codeLines[codeLines.length - 1].trim() === "") {
                            codeLines.pop();
                        }

                        node.children = codeLines.map((line, index) => {
                            const lineNumber = index + startLine;
                            const lineClassName = [classLine];
                            if (highlightedLines.has(lineNumber)) {
                                lineClassName.push(classLineHighlight);
                            }
                            return {
                                type: "element",
                                tagName: "span",
                                properties: {className: lineClassName, line: lineNumber.toString()},
                                children: lowlight.highlight(language, line, options).children,
                            };
                        });

                        const dataProperties: Properties = {
                            dataRawCode: rawCode,
                            dataLanguage: language,
                        };
                        if (title !== null) {
                            dataProperties.dataTitle = title;
                        }
                        parent.properties = {...parent.properties, ...dataProperties};
                    } else {
                        addNodeProperties(node, {className: classCode});
                    }
                }
            }
        });
}

// https://www.christopherbiscardi.com/build-time-code-blocks-with-rehype-prism-and-mdx
// https://codedaily.io/tutorials/Markdown-Syntax-Highlighting-with-PrismJS-using-Unified-Remark-and-Rehype

// https://uiwjs.github.io/react-textarea-code-editor/

// http://k88hudson.github.io/syntax-highlighting-theme-generator/www/
// https://github.com/timlrx/rehype-prism-plus
// https://github.com/howardroark/Markdown-Macros
