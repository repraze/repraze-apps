import {Section} from "@repraze/lib-ui/layout/section/section";
import {Wrapper} from "@repraze/lib-ui/layout/wrapper/wrapper";
import {DocumentId} from "@repraze/website-lib/types/document";
import {GetServerSideProps, InferGetServerSidePropsType} from "next/types";

import {usePost} from "../../../components/hooks/api-hooks";
import {AdminLayout} from "../../../components/layouts/admin-layout";
import {LoadingView} from "../../../components/views/loading";
import {NotFoundView} from "../../../components/views/not-found";
import {PostEditor} from "../../../components/views/post-editor";

export const getServerSideProps: GetServerSideProps<{id: DocumentId}> = async ({query}) => {
    try {
        const postId = DocumentId.parse(query.id);

        return {
            props: {
                id: postId,
            },
        };
    } catch (e) {
        return {
            notFound: true,
        };
    }
};

export default function EditPostView({id}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    // make sure to always refetch with staleTime 0
    const {data, isLoading, isError, isFetchedAfterMount} = usePost(id, {
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
                        <PostEditor post={data.post} />
                    </Wrapper>
                </Section>
            )}
        </AdminLayout>
    );
}
