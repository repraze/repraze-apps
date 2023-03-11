import {Section} from "@repraze/lib-ui/layout/section/section";
import {Wrapper} from "@repraze/lib-ui/layout/wrapper/wrapper";
import {URLId} from "@repraze/website-lib/types/document";
import {GetServerSideProps, InferGetServerSidePropsType} from "next/types";

import {usePage} from "../../../components/hooks/api-hooks";
import {AdminLayout} from "../../../components/layouts/admin-layout";
import {LoadingView} from "../../../components/views/loading";
import {NotFoundView} from "../../../components/views/not-found";
import {PageEditor} from "../../../components/views/page-editor";

export const getServerSideProps: GetServerSideProps<{id: URLId}> = async ({query}) => {
    try {
        const pageId = URLId.parse(query.id);

        return {
            props: {
                id: pageId,
            },
        };
    } catch (e) {
        return {
            notFound: true,
        };
    }
};

export default function EditPageView({id}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    // make sure to always refetch with staleTime 0
    const {data, isLoading, isError, isFetchedAfterMount} = usePage(id, {
        staleTime: 0,
        refetchOnWindowFocus: false,
    });

    // loading until fetch is done
    return (
        <AdminLayout>
            {isLoading || !isFetchedAfterMount ? (
                <LoadingView />
            ) : isError ? (
                <NotFoundView />
            ) : (
                <Section>
                    <Wrapper>
                        <PageEditor page={data.page} />
                    </Wrapper>
                </Section>
            )}
        </AdminLayout>
    );
}
