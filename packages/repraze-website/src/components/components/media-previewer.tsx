import {Box} from "@repraze/lib-ui/components/box/box";
import {Sizes} from "@repraze/lib-ui/constants";
import classnames from "classnames";
import React from "react";

import {MediaViewer} from "./media-viewer";

export interface MediaPreviewerProps {
    className?: string;
    size?: Sizes;
    id: string | undefined;
}

export function MediaPreviewer({className, size, id}: MediaPreviewerProps) {
    return (
        <Box
            className={classnames("media-previewer checkered", className, {
                ...(size !== undefined && {[size]: size}),
            })}
        >
            {id ? <MediaViewer id={id} /> : <div>Nothing to preview</div>}
        </Box>
    );
}
