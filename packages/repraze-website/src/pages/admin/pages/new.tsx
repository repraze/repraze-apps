import {Section} from "@repraze/lib-ui/layout/section/section";
import {Wrapper} from "@repraze/lib-ui/layout/wrapper/wrapper";
import React from "react";

import {AdminLayout} from "../../../components/layouts/admin-layout";
import {PageEditor} from "../../../components/views/page-editor";

export default function NewPageView() {
    return (
        <AdminLayout>
            <Section>
                <Wrapper>
                    <PageEditor />
                </Wrapper>
            </Section>
        </AdminLayout>
    );
}
