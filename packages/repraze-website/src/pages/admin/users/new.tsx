import {Section} from "@repraze/lib-ui/layout/section/section";
import {Wrapper} from "@repraze/lib-ui/layout/wrapper/wrapper";
import React from "react";

import {AdminLayout} from "../../../components/layouts/admin-layout";
import {UserEditor} from "../../../components/views/user-editor";

export default function NewUserView() {
    return (
        <AdminLayout>
            <Section>
                <Wrapper>
                    <UserEditor />
                </Wrapper>
            </Section>
        </AdminLayout>
    );
}
