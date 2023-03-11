import {faSort, faTag} from "@fortawesome/free-solid-svg-icons";
import {Button} from "@repraze/lib-ui/components/button/button";
import {Figure, FigureRatios} from "@repraze/lib-ui/components/figure/figure";
import {Control, Field, Fields} from "@repraze/lib-ui/components/form/field/field";
import {Select} from "@repraze/lib-ui/components/form/select/select";
import {Loader} from "@repraze/lib-ui/components/loader/loader";
import {Pagination} from "@repraze/lib-ui/components/pagination/pagination";
import {Tag, Tags} from "@repraze/lib-ui/components/tag/tag";
import {Title} from "@repraze/lib-ui/components/title/title";
import {Grid, GridCell} from "@repraze/lib-ui/layout/grid/grid";
import {Hero} from "@repraze/lib-ui/layout/hero/hero";
import {Section} from "@repraze/lib-ui/layout/section/section";
import {Wrapper} from "@repraze/lib-ui/layout/wrapper/wrapper";
import {QueryClient, dehydrate} from "@tanstack/react-query";
import Head from "next/head";
import Link from "next/link";
import {GetServerSideProps} from "next/types";
import {useCallback} from "react";

import {HackText} from "../../components/components/hack-text";
import {PostInfo} from "../../components/components/post-info";
import {usePosts} from "../../components/hooks/api-hooks";
import {useURLParamNumber, useURLParamStringArray} from "../../components/hooks/url-param-hook";
import {AppLayout} from "../../components/layouts/app-layout";
import {makeApiFetcher} from "../../components/providers/api/api";
import {ListPostsParams, listPosts} from "../../components/providers/api/api-queries";
import {serializeState} from "../../components/utils/state-utils";
import {titleFormat} from "../../lib/utils/meta-format";

const POSTS_PER_PAGE = 7;

export const getServerSideProps: GetServerSideProps<{dehydratedState: string}> = async ({query}) => {
    try {
        const queryClient = new QueryClient();
        const api = makeApiFetcher("http://localhost:3000/api/v1/");

        const params: ListPostsParams = {
            // pagination
            limit: POSTS_PER_PAGE,
            skip: 0 * POSTS_PER_PAGE,
            // filter
            published: true, // force for admin users
            listed: true, // force for admin users
            tags: [],
        };
        await queryClient.prefetchQuery(["posts", "list", params], () => listPosts(api, {}));

        return {
            props: {
                dehydratedState: serializeState(queryClient),
            },
        };
    } catch (e) {
        return {
            notFound: true,
        };
    }
};

export default function PostsView() {
    const [page, setPage] = useURLParamNumber("page", 0);
    const [tags, setTags] = useURLParamStringArray("tags", []);

    const {data, isLoading} = usePosts({
        // pagination
        limit: POSTS_PER_PAGE,
        skip: page * POSTS_PER_PAGE,
        // filter
        published: true, // force for admin users
        listed: true, // force for admin users
        tags: tags,
    });

    const handlePageChange = useCallback(
        (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, nextPage: number) => {
            event.preventDefault();
            setPage(nextPage);
            window.scrollTo(0, 0);
        },
        [setPage]
    );

    return (
        <AppLayout>
            <Head>
                <title>{titleFormat("Blog")}</title>
            </Head>
            <Hero className="posts-title">
                <Wrapper>
                    <Title size={1}>
                        <HackText text="Blog" />
                    </Title>
                </Wrapper>
            </Hero>
            <Section>
                <Wrapper className="posts-filter">
                    <Fields inline>
                        <Field>
                            <Control leftIcon={faTag}>
                                <Select
                                    options={[
                                        {label: "All", value: "all"},
                                        {label: "tag 1", value: "tag 1"},
                                    ]}
                                />
                            </Control>
                        </Field>
                        <Field expanded></Field>
                        <Field>
                            <Control leftIcon={faSort}>
                                <Select
                                    options={[
                                        {label: "Featured", value: "featured"},
                                        {label: "Recent", value: "recent"},
                                    ]}
                                />
                            </Control>
                        </Field>
                    </Fields>
                </Wrapper>
            </Section>
            <Section>
                <Wrapper className="posts-listing">
                    {isLoading ? (
                        <Loader expanded />
                    ) : (
                        <>
                            <Grid className="posts-list cols-2 gap-4">
                                {data?.posts.map((post) =>
                                    post.featured ? (
                                        <GridCell
                                            className="post featured box col-span-2 grid cols-2 gap-2"
                                            key={post.id}
                                        >
                                            {post.featured_media && (
                                                <div className="post-picture col-span-1">
                                                    <Figure
                                                        as={Link}
                                                        ratio={FigureRatios.R3By2}
                                                        href={`/posts/${post.id}`}
                                                    >
                                                        <img
                                                            src={`/medias/${post.featured_media?.id}${post.featured_media?.extension}`}
                                                        />
                                                    </Figure>
                                                </div>
                                            )}

                                            <div className="post-preview col-span-1 flex column gap-2">
                                                <header className="post-header">
                                                    <Title className="post-title" size={2}>
                                                        <Link href={`/posts/${post.id}`}>{post.title}</Link>
                                                    </Title>

                                                    <PostInfo className="post-info" post={post} />

                                                    {post.tags && post.tags.length > 0 && (
                                                        <Tags className="post-tags">
                                                            {post.tags.map((tag) => (
                                                                <Tag
                                                                    as={Link}
                                                                    className="post-tag"
                                                                    key={tag}
                                                                    href={`?tags=${tag}`}
                                                                >
                                                                    {tag}
                                                                </Tag>
                                                            ))}
                                                        </Tags>
                                                    )}
                                                </header>

                                                <div className="post-content content flex-1">{post.summary}</div>

                                                <div className="post-more">
                                                    <Button as={Link} href={`/posts/${post.id}`} fullwidth>
                                                        Read More
                                                    </Button>
                                                </div>
                                            </div>
                                        </GridCell>
                                    ) : (
                                        <GridCell
                                            className="post box col-span-2 gap-2 md-col-span-1 flex column"
                                            key={post.id}
                                        >
                                            {post.featured_media && (
                                                <div className="post-picture">
                                                    <Figure
                                                        as={Link}
                                                        ratio={FigureRatios.R3By1}
                                                        href={`/posts/${post.id}`}
                                                    >
                                                        <img
                                                            src={`/medias/${post.featured_media?.id}${post.featured_media?.extension}`}
                                                        />
                                                    </Figure>
                                                </div>
                                            )}

                                            <header className="post-header">
                                                <Title className="post-title" size={2}>
                                                    <Link href={`/posts/${post.id}`}>{post.title}</Link>
                                                </Title>

                                                <PostInfo className="post-info" post={post} />

                                                {post.tags && post.tags.length > 0 && (
                                                    <Tags className="post-tags">
                                                        {post.tags.map((tag) => (
                                                            <Tag
                                                                as={Link}
                                                                className="post-tag"
                                                                key={tag}
                                                                href={`?tags=${tag}`}
                                                            >
                                                                {tag}
                                                            </Tag>
                                                        ))}
                                                    </Tags>
                                                )}
                                            </header>

                                            <div className="post-content content flex-1">{post.summary}</div>

                                            <div className="post-more">
                                                <Button as={Link} href={`/posts/${post.id}`} fullwidth>
                                                    Read More
                                                </Button>
                                            </div>
                                        </GridCell>
                                    )
                                )}
                            </Grid>
                        </>
                    )}
                </Wrapper>
            </Section>
            <Section>
                <Wrapper className="posts-pagination">
                    <Pagination
                        pageSelected={page}
                        pageRange={1}
                        itemsCount={data ? data.count : 0}
                        itemsCountPerPage={POSTS_PER_PAGE}
                        link={(page) => `?page=${page}`}
                        onPageClick={handlePageChange}
                    />
                </Wrapper>
            </Section>
        </AppLayout>
    );
}
