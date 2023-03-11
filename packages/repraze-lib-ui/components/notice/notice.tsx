import {EventEmitter} from "@repraze/lib-utils/event-emitter";
import classnames from "classnames";
import React, {Fragment, ReactNode, createContext, useContext, useEffect, useMemo, useState} from "react";

import {Colors} from "../../constants";

export interface NoticeEmitterInterface {
    show: [string, ReactNode];
    hide: [string];
    clear: [];
}

export const NoticeContext = createContext(new EventEmitter<NoticeEmitterInterface>());

export interface NoticeProviderProps {
    children?: ReactNode;
}

export function NoticeProvider({children}: NoticeProviderProps) {
    const emitter = new EventEmitter<NoticeEmitterInterface>();
    return <NoticeContext.Provider value={emitter}>{children}</NoticeContext.Provider>;
}

export interface NoticeRendererProps {
    maxNotices?: number;
}

export interface NoticeItem {
    id: string;
    node: ReactNode;
}

export function NoticeRenderer({maxNotices}: NoticeRendererProps) {
    const [notices, setNotices] = useState<NoticeItem[]>([]);

    const emitter = useContext(NoticeContext);

    useEffect(() => {
        function showNotice(id: string, notice: ReactNode) {
            setTimeout(() => {
                setNotices((previousNotices) => {
                    const newNotices = [...previousNotices.filter((item) => item.id !== id), {id, node: notice}];
                    if (maxNotices !== undefined && maxNotices > 0) {
                        return newNotices.slice(-maxNotices);
                    }
                    return newNotices;
                });
            }, 0);
        }
        function hideNotice(id: string) {
            setTimeout(() => {
                setNotices((previousNotices) => previousNotices.filter((item) => item.id !== id));
            }, 0);
        }
        function clearNotices() {
            setTimeout(() => {
                setNotices([]);
            }, 0);
        }

        emitter.on("show", showNotice);
        emitter.on("hide", hideNotice);
        emitter.on("clear", clearNotices);
        return () => {
            emitter.off("show", showNotice);
            emitter.off("hide", hideNotice);
            emitter.off("clear", clearNotices);
        };
    }, [emitter, setNotices]);

    return notices.length > 0 ? (
        <div className="notice-container">
            {notices.map((item) => (
                <Fragment key={item.id}>{item.node}</Fragment>
            ))}
        </div>
    ) : (
        <></>
    );
}

export function useNotice() {
    const emitter = useContext(NoticeContext);
    const methods = useMemo(() => {
        return {
            showNotice(id: string, notice: ReactNode): void {
                emitter.emit("show", id, notice);
            },
            hideNotice(id: string): void {
                emitter.emit("hide", id);
            },
            clearNotice(): void {
                emitter.emit("clear");
            },
        };
    }, [emitter]);

    return methods;
}

export interface NoticeProps {
    className?: string;
    color?: Colors;
    cancelable?: boolean;
    onCancel?: () => void;
    children?: ReactNode;
}

// to not hide the Notification api
export function Notice({className, color, children}: NoticeProps) {
    return (
        <div
            className={classnames("notice", className, {
                ...(color !== undefined && {[color]: color}),
            })}
        >
            {children}
        </div>
    );
}
