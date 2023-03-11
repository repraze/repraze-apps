import {Section} from "@repraze/lib-ui/layout/section/section";
import {Wrapper} from "@repraze/lib-ui/layout/wrapper/wrapper";
import React from "react";

import {AdminLayout} from "../../../components/layouts/admin-layout";
import {PostEditor} from "../../../components/views/post-editor";

export default function NewPostView() {
    return (
        <AdminLayout>
            <Section>
                <Wrapper>
                    <PostEditor />
                </Wrapper>
            </Section>
        </AdminLayout>
    );
}
