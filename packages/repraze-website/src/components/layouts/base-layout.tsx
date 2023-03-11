import {ModalProvider} from "@repraze/lib-ui/components/modal/modal";
import {NoticeProvider, NoticeRenderer} from "@repraze/lib-ui/components/notice/notice";
import {ReactNode, Suspense} from "react";

import {ApiProvider} from "../providers/api";
import {ThemeProvider} from "../providers/theme";

export interface BaseLayoutProps {
    children?: ReactNode;
}

export function BaseLayout({children}: BaseLayoutProps) {
    return (
        <ApiProvider base={`${"http://localhost:3000"}/api/v1/`} clientId="dummy">
            <ThemeProvider>
                <ModalProvider>
                    <NoticeProvider>
                        <NoticeRenderer maxNotices={5} />
                        <Suspense>{children}</Suspense>
                    </NoticeProvider>
                </ModalProvider>
            </ThemeProvider>
        </ApiProvider>
    );
}
