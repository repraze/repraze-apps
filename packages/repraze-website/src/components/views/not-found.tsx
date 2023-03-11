import {Content} from "@repraze/lib-ui/components/content/content";
import {Title} from "@repraze/lib-ui/components/title/title";
import {Hero} from "@repraze/lib-ui/layout/hero/hero";
import {Section} from "@repraze/lib-ui/layout/section/section";
import {Wrapper} from "@repraze/lib-ui/layout/wrapper/wrapper";
import Head from "next/head";

export function NotFoundView() {
    return (
        <>
            <Head>
                <title>Repraze</title>
            </Head>
            <Hero>
                <Wrapper>
                    <Title size={1}>Not Found</Title>
                </Wrapper>
            </Hero>
            <Section>
                <Wrapper>
                    <Content>
                        <p>No page found at this address.</p>
                    </Content>
                </Wrapper>
            </Section>
        </>
    );
}
