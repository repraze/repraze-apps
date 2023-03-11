import {Section} from "@repraze/lib-ui/layout/section/section";
import {Wrapper} from "@repraze/lib-ui/layout/wrapper/wrapper";
import {DocumentId} from "@repraze/website-lib/types/document";
import {GetServerSideProps, InferGetServerSidePropsType} from "next/types";

import {useMedia} from "../../../components/hooks/api-hooks";
import {AdminLayout} from "../../../components/layouts/admin-layout";
import {LoadingView} from "../../../components/views/loading";
import {MediaEditor} from "../../../components/views/media-editor";
import {NotFoundView} from "../../../components/views/not-found";

export const getServerSideProps: GetServerSideProps<{id: DocumentId}> = async ({query}) => {
    try {
        const mediaId = DocumentId.parse(query.id);

        return {
            props: {
                id: mediaId,
            },
        };
    } catch (e) {
        return {
            notFound: true,
        };
    }
};

export default function EditMediaView({id}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    // make sure to always refetch with staleTime 0
    const {data, isLoading, isError, isFetchedAfterMount} = useMedia(id, {
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
                        <MediaEditor media={data.media} />
                    </Wrapper>
                </Section>
            )}
        </AdminLayout>
    );
}
