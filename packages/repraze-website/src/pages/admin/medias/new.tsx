import {Section} from "@repraze/lib-ui/layout/section/section";
import {Wrapper} from "@repraze/lib-ui/layout/wrapper/wrapper";
import React from "react";

import {AdminLayout} from "../../../components/layouts/admin-layout";
import {MediaEditor} from "../../../components/views/media-editor";

export default function NewMediaView() {
    return (
        <AdminLayout>
            <Section>
                <Wrapper>
                    <MediaEditor />
                </Wrapper>
            </Section>
        </AdminLayout>
    );
}
