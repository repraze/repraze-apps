import {Title} from "@repraze/lib-ui/components/title/title";
import {Hero} from "@repraze/lib-ui/layout/hero/hero";
import {Section} from "@repraze/lib-ui/layout/section/section";
import {Wrapper} from "@repraze/lib-ui/layout/wrapper/wrapper";
import {URLId} from "@repraze/website-lib/types/document";
import {Page} from "@repraze/website-lib/types/page";
import {DehydratedState, QueryClient, dehydrate} from "@tanstack/react-query";
import Head from "next/head";
import {GetServerSideProps, InferGetServerSidePropsType} from "next/types";

import {usePage} from "../../components/hooks/api-hooks";
import {AppLayout} from "../../components/layouts/app-layout";
import {makeApiFetcher} from "../../components/providers/api/api";
import {getPage} from "../../components/providers/api/api-queries";
import {serializeState} from "../../components/utils/state-utils";
import {LoadingView} from "../../components/views/loading";
import {NotFoundView} from "../../components/views/not-found";
import {titleFormat} from "../../lib/utils/meta-format";

export const getServerSideProps: GetServerSideProps<{dehydratedState: string; id: URLId}> = async ({query}) => {
    try {
        const queryClient = new QueryClient();
        const api = makeApiFetcher("http://localhost:3000/api/v1/");
        const pageId = URLId.parse(query.id);
        await queryClient.prefetchQuery(["pages", pageId], () => getPage(api, pageId));

        return {
            props: {
                dehydratedState: serializeState(queryClient),
                id: pageId,
            },
        };
    } catch (e) {
        return {
            notFound: true,
        };
    }
};

export default function PageView({id}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const {data, isLoading, isError} = usePage(id);

    return isLoading ? <LoadingView /> : isError || !data ? <NotFoundView /> : <PageDisplay page={data.page} />;
}

export interface PageDisplayProps {
    page: Page;
}

export function PageDisplay({page}: PageDisplayProps) {
    return (
        <AppLayout>
            <Head>
                <title>{titleFormat(page.title)}</title>
            </Head>
            <Hero
                className="page-title"
                style={
                    page.featured_media
                        ? {
                              backgroundImage: `url("/medias/${page.featured_media?.id}${page.featured_media?.extension}")`,
                              backgroundRepeat: "no-repeat",
                              backgroundPosition: "center",
                              backgroundSize: "cover",
                          }
                        : undefined
                }
            >
                <Wrapper>
                    <Title size={1}>{page.title}</Title>
                </Wrapper>
            </Hero>
            <Section>
                <Wrapper className="page content">
                    <div className="page-picture"></div>
                    <div className="page-content content">{page.content}</div>
                </Wrapper>
            </Section>
        </AppLayout>
    );
}
