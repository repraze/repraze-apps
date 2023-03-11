import {faTimes} from "@fortawesome/free-solid-svg-icons";
import {Button} from "@repraze/lib-ui/components/button/button";
import {Icon} from "@repraze/lib-ui/components/icon/icon";
import {Notice, useNotice} from "@repraze/lib-ui/components/notice/notice";
import {Colors} from "@repraze/lib-ui/constants";
import "@repraze/lib-utils/id";
import {generateId} from "@repraze/lib-utils/id";
import {delay} from "@repraze/lib-utils/timing";
import React, {ReactNode, useMemo} from "react";

export enum NoticeMessageTypes {
    Notification = "notification",
    Success = "success",
    Information = "information",
    Warning = "warning",
    Error = "error",
}

export const NOTICE_MESSAGE_TYPE_TO_COLOR = {
    [NoticeMessageTypes.Notification]: undefined,
    [NoticeMessageTypes.Success]: Colors.Success,
    [NoticeMessageTypes.Information]: Colors.Info,
    [NoticeMessageTypes.Warning]: Colors.Warning,
    [NoticeMessageTypes.Error]: Colors.Danger,
};

// const NOTICE_MESSAGE_TIMING = 300000;
const NOTICE_MESSAGE_TIMING = 3000;

export function useNoticeMessage() {
    const {showNotice, hideNotice} = useNotice();
    const methods = useMemo(() => {
        return {
            showNoticeMessage(message: ReactNode, type: NoticeMessageTypes): void {
                // emitter.emit("show", id, notice);
                const id = generateId();
                const color = NOTICE_MESSAGE_TYPE_TO_COLOR[type];
                showNotice(
                    id,
                    <Notice color={color}>
                        {message}
                        <Button color={Colors.Transparent} className="delete" onClick={hideNotice.bind(undefined, id)}>
                            <Icon icon={faTimes} />
                        </Button>
                    </Notice>
                );
                delay(NOTICE_MESSAGE_TIMING).then(() => {
                    hideNotice(id);
                });
            },
        };
    }, [showNotice, hideNotice]);
    return methods;
}
