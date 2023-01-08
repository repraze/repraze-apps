import {faDownload} from "@fortawesome/free-solid-svg-icons";
import React, {useEffect, useState} from "react";

import {Media} from "../../repraze-types/media";
import {Button} from "../../repraze-ui-lib/components/button/button";
import {Textarea} from "../../repraze-ui-lib/components/form/textarea/textarea";
import {Icon} from "../../repraze-ui-lib/components/icon/icon";
import {useApi} from "../providers/api";

export interface MediaViewProps {
    id: string;
}

export function MediaViewer({id}: MediaViewProps) {
    const api = useApi();

    const [media, setMedia] = useState<Media | undefined>(undefined);

    useEffect(() => {
        async function fetchMedia() {
            try {
                const response = await api.fetch(`medias/${id}`);
                const media: Media = response.data;
                setMedia(media);
            } catch (e) {
                setMedia(undefined);
            }
        }
        fetchMedia();
    }, [api]);

    if (media) {
        const Component = mediaViewRender(media);
        return <Component media={media} />;
    } else {
        return <div>loading</div>;
    }
}

function mediaViewRender(media: Media) {
    const {category} = media;
    if (category) {
        switch (category) {
            case "application":
                return DownloadView;
            case "audio":
                return AudioView;
            case "font":
                return DownloadView;
            case "image":
                return ImageView;
            case "text":
                return TextView;
            case "video":
                return VideoView;
            case "archive":
                return DownloadView;
            default:
                return DownloadView;
        }
    }

    return DownloadView;
}

interface SubMediaViewProps {
    media: Media;
}

function DownloadView({media}: SubMediaViewProps) {
    return (
        <a download={`/medias/${media.id}${media.extension}`}>
            <Button>
                <Icon icon={faDownload} />
                <span>Download</span>
            </Button>
        </a>
    );
}

function AudioView({media}: SubMediaViewProps) {
    return <audio src={`/medias/${media.id}${media.extension}`} controls />;
}

function ImageView({media}: SubMediaViewProps) {
    return <img src={`/medias/${media.id}${media.extension}`} />;
}

function TextView({media}: SubMediaViewProps) {
    return <Textarea value={`/medias/${media.id}${media.extension}`} readOnly />;
}

function VideoView({media}: SubMediaViewProps) {
    return <video src={`/medias/${media.id}${media.extension}`} controls />;
}
