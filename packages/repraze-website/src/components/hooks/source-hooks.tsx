import {IconProp} from "@fortawesome/fontawesome-svg-core";
import {
    faAlignLeft,
    faArchive,
    faCode,
    faEyeSlash,
    faFileAlt,
    faFont,
    faImage,
    faVideo,
    faVolumeUp,
} from "@fortawesome/free-solid-svg-icons";
import {AutocompleteOption} from "@repraze/lib-ui/components/autocomplete/autocomplete";
import {Icon, Icons} from "@repraze/lib-ui/components/icon/icon";
import {Colors} from "@repraze/lib-ui/constants";
import {debounce} from "@repraze/lib-utils/timing";
import {Medias} from "@repraze/website-lib/types/media";
import {MediaCategory} from "@repraze/website-lib/types/media-basic";
import {Users} from "@repraze/website-lib/types/user";
import React from "react";
import {useCallback} from "react";

import {useApi} from "../providers/api";

export type MediaCategoryInfo = {icon: IconProp; color?: Colors; label: string};

export const MEDIA_CATEGORY_TO_INFO: Record<MediaCategory, MediaCategoryInfo> = {
    // mime type
    application: {icon: faCode, color: Colors.Red, label: "Application"},
    audio: {icon: faVolumeUp, color: Colors.Yellow, label: "Audio"},
    font: {icon: faFont, color: Colors.Pink, label: "Font"},
    image: {icon: faImage, color: Colors.Purple, label: "Image"},
    // "model", // not in use
    text: {icon: faAlignLeft, color: Colors.Green, label: "Text"},
    video: {icon: faVideo, color: Colors.Orange, label: "Video"},
    // special
    archive: {icon: faArchive, color: Colors.Red, label: "Archive"},
    // unknown
    other: {icon: faFileAlt, color: Colors.Blue, label: "Other"},
};

export interface MediaSourceProps {
    debounceMs?: number;
    // pagination
    limit?: number;
    // filter
    public?: boolean;
    category?: MediaCategory;
}

export function useMediaSource({debounceMs, limit, public: publicFlag, category}: MediaSourceProps = {}) {
    const api = useApi();

    return useCallback<(query: string) => Promise<AutocompleteOption[]>>(
        debounce(debounceMs ?? 250, async (query: string) => {
            try {
                const params = new URLSearchParams();
                params.set("limit", `${limit ?? 10}`);
                if (publicFlag !== undefined) {
                    params.set("public", `${publicFlag}`);
                }
                if (category !== undefined) {
                    params.set("category", category);
                }
                params.set("search", query);
                const response = await api.get(`medias?${params}`);
                const medias = Medias.parse(response.data);
                return medias.reduce<AutocompleteOption[]>((options, media) => {
                    if (media.id) {
                        const categoryInfo = MEDIA_CATEGORY_TO_INFO[media.category || "other"];
                        options.push({
                            label: (
                                <span className="icon-item">
                                    <Icons title={categoryInfo.label}>
                                        <Icon icon={categoryInfo.icon} color={categoryInfo.color} fixedWidth />
                                        {!media.public && (
                                            <Icon icon={faEyeSlash} fixedWidth transform={{size: 12, x: 8, y: 8}} />
                                        )}
                                    </Icons>
                                    <span>{media.title}</span>
                                </span>
                            ),
                            id: media.id,
                        });
                    }
                    return options;
                }, []);
            } catch (error) {
                // TODO: error
                console.log(error);
                return [];
            }
        }),
        [debounceMs, limit, publicFlag, category, api]
    );
}

export interface UserSourceProps {
    debounceMs?: number;
    // pagination
    limit?: number;
    // filter
}

export function useUserSource({debounceMs, limit}: UserSourceProps = {}) {
    const api = useApi();

    return useCallback<(query: string) => Promise<AutocompleteOption[]>>(
        debounce(debounceMs ?? 250, async (query: string) => {
            try {
                const params = new URLSearchParams();
                params.set("limit", `${limit ?? 10}`);
                params.set("search", query);
                const response = await api.get(`users?${params}`);
                const users = Users.parse(response.data);
                return users.map<AutocompleteOption>((user) => ({
                    label: user.name,
                    id: user.username,
                }));
            } catch (error) {
                // TODO: error
                console.log(error);
                return [];
            }
        }),
        [debounceMs, limit, api]
    );
}
