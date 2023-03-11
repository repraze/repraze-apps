import {faCheck, faCopy, faPlay, faTimes} from "@fortawesome/free-solid-svg-icons";
import {Button} from "@repraze/lib-ui/components/button/button";
import {Icon} from "@repraze/lib-ui/components/icon/icon";
import {Table, TableContainer} from "@repraze/lib-ui/components/table/table";
import {TitleAnchor} from "@repraze/lib-ui/components/title/title";
import {Colors} from "@repraze/lib-ui/constants";
import {Grid, GridCell} from "@repraze/lib-ui/layout/grid/grid";
import {copyToClipboard} from "@repraze/lib-ui/utils/clipboad";
import React, {HTMLAttributes, useCallback} from "react";

export interface ContentCodeViewerProps extends HTMLAttributes<HTMLPreElement> {
    "data-raw-code": string;
    "data-language": string;
    "data-title"?: string;
}

export function ContentCodeViewer({
    ["data-raw-code"]: rawCode,
    ["data-language"]: language,
    ["data-title"]: title,
    children,
    ...props
}: ContentCodeViewerProps) {
    const handleCopyToClipboard = useCallback(
        async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            const copied = await copyToClipboard(rawCode);
            // if (copied) {
            //     stateButton.setState({icon: faCheck, color: Colors.Success});
            // } else {
            //     stateButton.setState({icon: faTimes, color: Colors.Danger});
            // }
            // await delay(1000);
            // stateButton.reset();
        },
        [rawCode]
    );
    return (
        <div className="code-viewer">
            <div className="code-heading">
                <div className="code-language">{language}</div>
                <div className="code-title">{title}</div>
                <div className="code-actions">
                    <Button title="Copy" color={Colors.Transparent} onClick={handleCopyToClipboard}>
                        <Icon icon={faCopy} fixedWidth />
                    </Button>
                </div>
            </div>
            <pre {...props}>{children}</pre>
        </div>
    );
}

export const ContentTable = (props: any) => (
    <TableContainer>
        <Table expand {...props} />
    </TableContainer>
);

export const makeContentTitle = (Component: "h1" | "h2" | "h3" | "h4" | "h5" | "h6") =>
    function ContentTitle({id, children}: any) {
        return (
            <Component id={id}>
                {children}
                <TitleAnchor toId={id} />
            </Component>
        );
    };

export const ContentH1 = makeContentTitle("h1");
export const ContentH2 = makeContentTitle("h2");
export const ContentH3 = makeContentTitle("h3");
export const ContentH4 = makeContentTitle("h4");
export const ContentH5 = makeContentTitle("h5");
export const ContentH6 = makeContentTitle("h6");

export const ContentYoutube = ({id}: any) => {
    return (
        <div className="media-viewer">
            <iframe
                className="media"
                width="560"
                height="315"
                src={`https://www.youtube.com/embed/${id}?rel=0&ab_channel=Repraze`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </div>
    );
};

export const ContentYoutubePreview = ({id}: any) => {
    return (
        <a className="media-viewer" href={`https://youtu.be/${id}`} target="_blank" rel="noreferrer">
            <img className="media" src={`https://i2.ytimg.com/vi/${id}/mqdefault.jpg`} loading="lazy" />
            <Button className="media-icon" color={Colors.Primary}>
                <Icon icon={faPlay} fixedWidth />
            </Button>
        </a>
    );
};

export const ContentGrid = ({children, ...props}: any) => {
    //TODO: col count
    return (
        <Grid className="content-grid" {...props}>
            {children}
        </Grid>
    );
};

export const ContentGridTile = ({size, children, ...props}: any) => {
    //TODO: span
    return <GridCell className={`col-span-${size}`}>{children}</GridCell>;
};

export const ContentDataTable = () => {
    // TODO: create data api
    return null;
};
