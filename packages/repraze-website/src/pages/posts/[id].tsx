import {Box} from "@repraze/lib-ui/components/box/box";
import {Figure, FigureRatios} from "@repraze/lib-ui/components/figure/figure";
import {Loader} from "@repraze/lib-ui/components/loader/loader";
import {Tag, Tags} from "@repraze/lib-ui/components/tag/tag";
import {Title} from "@repraze/lib-ui/components/title/title";
import {Sizes} from "@repraze/lib-ui/constants";
import {Card, CardContent, CardRight} from "@repraze/lib-ui/layout/card/card";
import {Hero} from "@repraze/lib-ui/layout/hero/hero";
import {Section} from "@repraze/lib-ui/layout/section/section";
import {Wrapper} from "@repraze/lib-ui/layout/wrapper/wrapper";
import {DocumentId} from "@repraze/website-lib/types/document";
import {Post, Posts} from "@repraze/website-lib/types/post";
import {Username} from "@repraze/website-lib/types/user-basic";
import {QueryClient, dehydrate} from "@tanstack/react-query";
import Head from "next/head";
import Link from "next/link";
import {GetServerSideProps, InferGetServerSidePropsType} from "next/types";

import {HackText} from "../../components/components/hack-text";
import {Markdown} from "../../components/components/markdown/markdown";
import {PostInfo} from "../../components/components/post-info";
import {UserProfile} from "../../components/components/user-profile";
import {usePost, usePostRelated, usePosts, useUser} from "../../components/hooks/api-hooks";
import {AppLayout} from "../../components/layouts/app-layout";
import {makeApiFetcher} from "../../components/providers/api/api";
import {getPost} from "../../components/providers/api/api-queries";
import {serializeState} from "../../components/utils/state-utils";
import {LoadingView} from "../../components/views/loading";
import {NotFoundView} from "../../components/views/not-found";
import {titleFormat} from "../../lib/utils/meta-format";

export const getServerSideProps: GetServerSideProps<{dehydratedState: string; id: DocumentId}> = async ({query}) => {
    try {
        const queryClient = new QueryClient();
        const api = makeApiFetcher("http://localhost:3000/api/v1/");
        const postId = DocumentId.parse(query.id);
        await queryClient.prefetchQuery(["posts", postId], () => getPost(api, postId));

        return {
            props: {
                dehydratedState: serializeState(queryClient),
                id: postId,
            },
        };
    } catch (e) {
        return {
            notFound: true,
        };
    }
};

export default function PostView({id}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const {data, isLoading, isError} = usePost(id);

    return isLoading ? <LoadingView /> : isError || !data ? <NotFoundView /> : <PostDisplay post={data.post} />;
}

export interface PostDisplayProps {
    post: Post;
}

export function PostDisplay({post}: PostDisplayProps) {
    return (
        <AppLayout>
            <Head>
                <title>{titleFormat(post.title)}</title>
                <meta name="description" content={post.summary} />
                <meta name="keywords" content={post.tags.join(", ")} />
                {post.creation_user && <meta name="author" content={post.creation_user.name} />}
            </Head>

            <article className="post">
                <Hero>
                    <Wrapper>
                        <header className="post-header">
                            <Title size={1} className="post-title">
                                <HackText text={post.title} />
                            </Title>

                            <PostInfo className="post-info" post={post} />

                            {post.tags && post.tags.length > 0 && (
                                <Tags className="post-tags">
                                    {post.tags.map((tag) => (
                                        <Tag as={Link} className="post-tag" key={tag} href={`?tags=${tag}`}>
                                            {tag}
                                        </Tag>
                                    ))}
                                </Tags>
                            )}
                        </header>
                    </Wrapper>
                </Hero>

                <Section>
                    <Wrapper>
                        <div className="post-layout">
                            <main className="post-content content">
                                {post.featured_media && (
                                    <Section>
                                        <Figure ratio={FigureRatios.R2By1}>
                                            <img
                                                src={`/medias/${post.featured_media.id}${post.featured_media.extension}`}
                                            />
                                        </Figure>
                                    </Section>
                                )}

                                <Section>
                                    <Markdown>{post.content}</Markdown>
                                </Section>
                            </main>

                            <aside className="post-aside">
                                <div style={{position: "sticky", top: 0}}>
                                    {post.author_users && post.author_users.length === 1 && (
                                        <Section>
                                            <UserCard username={post.author_users[0].username} />
                                        </Section>
                                    )}

                                    {post.id && (
                                        <Section>
                                            <PostRelatedCard id={post.id} />
                                        </Section>
                                    )}

                                    <Section>
                                        <PostsRecentCard />
                                    </Section>
                                </div>
                            </aside>
                        </div>
                    </Wrapper>
                </Section>
            </article>
        </AppLayout>
    );
}

export interface UserCardProps {
    username: Username;
}

export function UserCard({username}: UserCardProps) {
    const {data, isLoading, isError} = useUser(username);
    return (
        <Box>
            <Title size={6}>About the Author</Title>
            {isLoading ? (
                <Loader />
            ) : isError || !data ? (
                <NotFoundView />
            ) : (
                <>
                    <UserProfile user={data.user} href={`/users/${data.user.username}`} size={Sizes.Large} />
                    <p>{data.user.bio}</p>
                </>
            )}
        </Box>
    );
}

export interface PostRelatedCardProps {
    id: DocumentId;
}

export function PostRelatedCard({id}: PostRelatedCardProps) {
    const {data, isLoading, isError} = usePostRelated(id);
    return (
        <Box>
            <Title size={6}>Related Posts</Title>

            {isLoading ? <Loader /> : isError || !data ? <NotFoundView /> : <PostList posts={data.posts} />}
        </Box>
    );
}

export function PostsRecentCard() {
    const {data, isLoading, isError} = usePosts({
        // pagination
        limit: 5,
        skip: 0,
        // filter
        published: true, // force for admin users
        listed: true, // force for admin users
    });

    return (
        <Box>
            <Title size={6}>Recent Posts</Title>
            {isLoading ? <Loader /> : isError || !data ? <NotFoundView /> : <PostList posts={data.posts} />}
        </Box>
    );
}

export interface PostListProps {
    posts: Posts;
}

function PostList({posts}: PostListProps) {
    return (
        <>
            {posts.map((post) => (
                <Card key={post.id}>
                    <CardContent>
                        {post.author_users && post.author_users.length === 1 && (
                            <p>
                                <UserProfile
                                    user={post.author_users[0]}
                                    href={`/users/${post.author_users[0].username}`}
                                    size={Sizes.Normal}
                                />
                            </p>
                        )}
                        <p>{post.title}</p>
                    </CardContent>

                    {post.featured_media && (
                        <CardRight>
                            <Figure ratio={FigureRatios.R1By1} size={Sizes.Medium}>
                                <img src={`/medias/${post.featured_media?.id}${post.featured_media?.extension}`} />
                            </Figure>
                        </CardRight>
                    )}
                </Card>
            ))}
        </>
    );
}
