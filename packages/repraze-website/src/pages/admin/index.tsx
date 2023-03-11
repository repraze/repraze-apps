import {Title} from "@repraze/lib-ui/components/title/title";
import {Hero} from "@repraze/lib-ui/layout/hero/hero";
import {Section} from "@repraze/lib-ui/layout/section/section";
import {Wrapper} from "@repraze/lib-ui/layout/wrapper/wrapper";
import Head from "next/head";

import {AdminLayout} from "../../components/layouts/admin-layout";
import {titleFormat} from "../../lib/utils/meta-format";

export default function AdminHomeView() {
    return (
        <AdminLayout>
            <Head>
                <title>{titleFormat("Dashboard")}</title>
            </Head>
            <Hero className="dashboard-title">
                <Wrapper>
                    <Title size={1}>Admin</Title>
                </Wrapper>
            </Hero>

            <Section>
                <Wrapper>test</Wrapper>
            </Section>
        </AdminLayout>
    );
}

AdminHomeView.getLayout = () => {
    return AdminLayout;
};
