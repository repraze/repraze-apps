import {Section} from "@repraze/lib-ui/layout/section/section";
import {Wrapper} from "@repraze/lib-ui/layout/wrapper/wrapper";
import {DocumentId} from "@repraze/website-lib/types/document";
import {Username} from "@repraze/website-lib/types/user-basic";
import {GetServerSideProps, InferGetServerSidePropsType} from "next/types";

import {useUser} from "../../../components/hooks/api-hooks";
import {AdminLayout} from "../../../components/layouts/admin-layout";
import {LoadingView} from "../../../components/views/loading";
import {NotFoundView} from "../../../components/views/not-found";
import {UserEditor} from "../../../components/views/user-editor";

export const getServerSideProps: GetServerSideProps<{username: Username}> = async ({query}) => {
    try {
        const username = Username.parse(query.id);

        return {
            props: {
                username: username,
            },
        };
    } catch (e) {
        return {
            notFound: true,
        };
    }
};

export default function EditUserView({username}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    // make sure to always refetch with staleTime 0
    const {data, isLoading, isError, isFetchedAfterMount} = useUser(username, {
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
                        <UserEditor user={data.user} />
                    </Wrapper>
                </Section>
            )}
        </AdminLayout>
    );
}
