import React, {createElement, useEffect, useState} from "react";
import htmlAstToReact from "rehype-react";
import rehypeSlug from "rehype-slug";
import remarkDirective from "remark-directive";
import remarkDirectiveRehype from "remark-directive-rehype";
import gfmPlugin from "remark-gfm";
import mdParse from "remark-parse";
import mdAstToHtmlAst from "remark-rehype";
import {unified} from "unified";

import {
    ContentCodeViewer,
    ContentGrid,
    ContentGridTile,
    ContentH1,
    ContentH2,
    ContentH3,
    ContentH4,
    ContentH5,
    ContentH6,
    ContentTable,
    ContentYoutube,
    ContentYoutubePreview,
} from "./markdown-components";
import {rehypeHighlight} from "./rehype-highlight";

const processor = unified()
    .use(mdParse)
    .use(gfmPlugin)
    .use(remarkDirective)
    .use(remarkDirectiveRehype)
    .use(mdAstToHtmlAst, {allowDangerousHtml: false})
    .use(rehypeHighlight, {transformPreTagName: "code-viewer"})
    .use(rehypeSlug)
    .use(htmlAstToReact, {
        createElement: createElement,
        components: {
            table: ContentTable,
            h1: ContentH1,
            h2: ContentH2,
            h3: ContentH3,
            h4: ContentH4,
            h5: ContentH5,
            h6: ContentH6,
            "code-viewer": ContentCodeViewer,
            youtube: ContentYoutube,
            "youtube-preview": ContentYoutubePreview,
            grid: ContentGrid,
            "grid-tile": ContentGridTile,
        } as any, // to allow custom
    });

export interface MarkdownProps {
    children: string;
}

export function Markdown({children}: MarkdownProps) {
    const [content, setContent] = useState(<></>);

    useEffect(() => {
        async function parseMarkdown() {
            const file = await processor.process(children);
            setContent(file.result);
        }
        parseMarkdown();
    }, [children]);

    return <>{content}</>;
}
