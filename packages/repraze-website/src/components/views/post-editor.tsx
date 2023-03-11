import {
    faAlignLeft,
    faCircleNotch,
    faEye,
    faInfoCircle,
    faPen,
    faSave,
    faSlidersH,
    faTrash,
    faUndo,
} from "@fortawesome/free-solid-svg-icons";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "@repraze/lib-ui/components/button/button";
import {Control, Field, Fields} from "@repraze/lib-ui/components/form/field/field";
import {Help} from "@repraze/lib-ui/components/form/help/help";
import {InputAutocomplete} from "@repraze/lib-ui/components/form/input-autocomplete/input-autocomplete";
import {InputSwitch} from "@repraze/lib-ui/components/form/input-switch/input-switch";
import {Input} from "@repraze/lib-ui/components/form/input/input";
import {Label} from "@repraze/lib-ui/components/form/label/label";
import {Textarea} from "@repraze/lib-ui/components/form/textarea/textarea";
import {Icon} from "@repraze/lib-ui/components/icon/icon";
import {ModalDialog, useModal} from "@repraze/lib-ui/components/modal/modal";
import {TabsPanel} from "@repraze/lib-ui/components/tab/tab";
import {Colors, Sizes} from "@repraze/lib-ui/constants";
import {Post} from "@repraze/website-lib/types/post";
import {useQueryClient} from "@tanstack/react-query";
import Head from "next/head";
import Link from "next/link";
import {useRouter} from "next/router";
import {FormEventHandler, useCallback} from "react";
import {SubmitHandler, useForm} from "react-hook-form";
import {z} from "zod";

import {titleFormat} from "../../lib/utils/meta-format";
import {AuditMetaDetails} from "../components/audit-meta-details";
import {ControlledInputDatetime} from "../components/controlled-input-datetime";
import {ControlledInputTag} from "../components/controlled-input-tag";
import {ControlledAutocompleteInputTag} from "../components/controlled-input-tag-autocomplete";
import {MarkdownEditor} from "../components/markdown-editor";
import {Markdown} from "../components/markdown/markdown";
import {MediaPreviewer} from "../components/media-previewer";
import {NoticeMessageTypes, useNoticeMessage} from "../components/notice-message";
import {usePostMutation} from "../hooks/api-hooks";
import {useHistoryBlock} from "../hooks/history-block-hook";
import {useMediaSource, useUserSource} from "../hooks/source-hooks";
import {useApi} from "../providers/api";
import {extractError} from "../utils/hook-form-utils";

const PostForm = Post;

type PostForm = z.infer<typeof PostForm>;

function postToForm(post?: Post): PostForm {
    if (post) {
        return post;
    } else {
        return {
            // fields
            id: null,
            title: "",
            summary: "",
            content: "",
            tags: [],

            author_user_ids: [],

            featured_media_id: null,
            // visibility
            public: true,
            listed: true,
            featured: false,
            publish_date: null,
        };
    }
}

export interface PostEditorProps {
    post?: Post;
}

export function PostEditor({post}: PostEditorProps) {
    const router = useRouter();
    const api = useApi();
    const queryClient = useQueryClient();
    const {showModal, clearModal} = useModal();
    const {showNoticeMessage} = useNoticeMessage();

    const isNew = post === undefined;
    const postId = !isNew ? post.id : null;

    const {
        register,
        handleSubmit,
        watch,
        formState: {isSubmitting, isDirty, errors},
        reset,
        control,
    } = useForm<PostForm>({
        mode: "onBlur",
        reValidateMode: "onChange",
        resolver: zodResolver(PostForm),
        defaultValues: postToForm(post),
    });

    const postMutation = usePostMutation();

    const historyBlockCondition = useCallback((): boolean => isDirty, [isDirty]);
    const {unblock} = useHistoryBlock({
        condition: historyBlockCondition,
        onBlock: (next) => {
            showModal(
                <ModalDialog
                    title="Leave Editor"
                    text="Are you sure you want to cancel changes?"
                    actions={[
                        {id: "yes", label: "Yes", color: Colors.Primary},
                        {id: "no", label: "No"},
                    ]}
                    onAction={(actionId) => {
                        clearModal();
                        if (actionId === "yes") {
                            next();
                        }
                    }}
                    cancelable
                />
            );
        },
    });

    const handleFormSubmit = useCallback<FormEventHandler<HTMLFormElement>>(async (event) => {
        event.preventDefault();
    }, []);

    const handleSave = useCallback<SubmitHandler<PostForm>>(
        async (data) => {
            try {
                const update: Post = {
                    id: data.id,
                    title: data.title,
                    summary: data.summary,
                    content: data.content,
                    tags: data.tags,
                    author_user_ids: data.author_user_ids,
                    featured_media_id: data.featured_media_id,

                    public: data.public,
                    listed: data.listed,
                    featured: data.featured,
                    publish_date: data.publish_date,

                    comment: data.comment,
                };

                const {post} = await postMutation.mutateAsync({id: postId, post: update});

                showNoticeMessage(isNew ? "Post created." : "Post saved.", NoticeMessageTypes.Success);

                if (postId === post.id) {
                    reset(postToForm(post));
                } else {
                    // unblock to navigate
                    unblock();
                    router.push(`/admin/posts/${post.id}`);
                }

                queryClient.invalidateQueries({queryKey: ["posts"]});
            } catch (e) {
                if (e instanceof Error) {
                    showNoticeMessage(
                        `Error while ${isNew ? "creating" : "saving"} post: ${e.message}`,
                        NoticeMessageTypes.Error
                    );
                } else {
                    showNoticeMessage(`Error while ${isNew ? "creating" : "saving"} post.`, NoticeMessageTypes.Error);
                }
            }
        },
        [isNew, postId, postMutation]
    );

    const handleDelete = useCallback(async () => {
        if (post) {
            showModal(
                <ModalDialog
                    title="Delete Post"
                    text="Are you sure you want to delete this post?"
                    actions={[
                        {id: "delete", label: "Delete", color: Colors.Danger},
                        {id: "cancel", label: "Cancel"},
                    ]}
                    onAction={async (actionId) => {
                        clearModal();
                        if (actionId === "delete") {
                            try {
                                await api.delete(`posts/${post.id}`);
                                unblock();
                                router.push(`/admin/posts`);
                                queryClient.invalidateQueries({queryKey: ["posts"]});
                                showNoticeMessage("Post deleted.", NoticeMessageTypes.Success);
                            } catch (e) {
                                console.error(e);
                            }
                        }
                    }}
                    cancelable
                />
            );
        }
    }, [post]);

    const [
        watchTitle,
        watchContent,
        watchFeaturedMediaId,
        watchCreationDate,
        watchCreationUser,
        watchLastEditDate,
        watchLastEditUser,
    ] = watch([
        "title",
        "content",
        "featured_media_id",
        "creation_date",
        "creation_user",
        "last_edit_date",
        "last_edit_user",
    ]);

    const mediaSource = useMediaSource({category: "image"});
    const userSource = useUserSource();

    return (
        <>
            <Head>
                <title>{titleFormat(`${watchTitle ? watchTitle : "Untitled Post"}`)}</title>
            </Head>
            <form onSubmit={handleFormSubmit}>
                <Fields>
                    <Label htmlFor="title_field">Title</Label>
                    <Field>
                        <Control expanded>
                            <Input
                                id="title_field"
                                placeholder="Title"
                                size={Sizes.Medium}
                                color={errors.title ? Colors.Danger : undefined}
                                {...register("title")}
                                autoFocus
                            />
                        </Control>
                    </Field>
                    {errors.title && <Help color={Colors.Danger}>{extractError(errors.title)}</Help>}

                    <Label htmlFor="id_field">Id</Label>
                    <Field>
                        <Control expanded>
                            <Input id="id_field" placeholder="Id" size={Sizes.Small} {...register("id")} disabled />
                        </Control>
                    </Field>

                    <Field>
                        <Control expanded>
                            <TabsPanel
                                defaultTabId={"content"}
                                tabs={[
                                    {
                                        id: "content",
                                        label: (
                                            <>
                                                <Icon icon={faAlignLeft} fixedWidth />
                                                <span>Content</span>
                                            </>
                                        ),
                                        content: (
                                            <Fields>
                                                <Label htmlFor="content_field">Content</Label>
                                                <Field>
                                                    <Control expanded>
                                                        <TabsPanel
                                                            defaultTabId={"edit"}
                                                            tabs={[
                                                                {
                                                                    id: "edit",
                                                                    label: (
                                                                        <>
                                                                            <Icon icon={faPen} fixedWidth />
                                                                            <span>Edit</span>
                                                                        </>
                                                                    ),
                                                                    content: (
                                                                        <MarkdownEditor
                                                                            id="content_field"
                                                                            placeholder="Content"
                                                                            rows={16}
                                                                            color={
                                                                                errors.content
                                                                                    ? Colors.Danger
                                                                                    : undefined
                                                                            }
                                                                            {...register("content")}
                                                                        />
                                                                    ),
                                                                },
                                                                {
                                                                    id: "preview",
                                                                    label: (
                                                                        <>
                                                                            <Icon icon={faEye} fixedWidth />
                                                                            <span>Preview</span>
                                                                        </>
                                                                    ),
                                                                    content: (
                                                                        <div className="preview content">
                                                                            <Markdown>{watchContent}</Markdown>
                                                                        </div>
                                                                    ),
                                                                },
                                                            ]}
                                                        />
                                                    </Control>
                                                </Field>
                                                {errors.content && (
                                                    <Help color={Colors.Danger}>{extractError(errors.content)}</Help>
                                                )}
                                            </Fields>
                                        ),
                                    },
                                    {
                                        id: "properties",
                                        label: (
                                            <>
                                                <Icon icon={faSlidersH} fixedWidth />
                                                <span>Properties</span>
                                            </>
                                        ),
                                        content: (
                                            <Fields>
                                                <Label htmlFor="summary_field">Summary</Label>
                                                <Field>
                                                    <Control expanded>
                                                        <Textarea
                                                            id="summary_field"
                                                            placeholder="Summary"
                                                            rows={3}
                                                            noResize
                                                            color={errors.summary ? Colors.Danger : undefined}
                                                            {...register("summary")}
                                                        ></Textarea>
                                                    </Control>
                                                </Field>
                                                {errors.summary && (
                                                    <Help color={Colors.Danger}>{extractError(errors.summary)}</Help>
                                                )}

                                                <Label htmlFor="featured_media_field">Featured Media</Label>
                                                <Field>
                                                    <Control expanded>
                                                        <MediaPreviewer
                                                            size={Sizes.Small}
                                                            id={watchFeaturedMediaId || undefined}
                                                        />
                                                    </Control>
                                                </Field>
                                                <Field>
                                                    <Control expanded>
                                                        <InputAutocomplete
                                                            id="featured_media_field"
                                                            placeholder="Featured Media"
                                                            source={mediaSource}
                                                            color={errors.featured_media_id ? Colors.Danger : undefined}
                                                            {...register("featured_media_id", {
                                                                setValueAs: (value: string) => value || null,
                                                            })}
                                                        />
                                                    </Control>
                                                </Field>
                                                {errors.featured_media_id && (
                                                    <Help color={Colors.Danger}>
                                                        {extractError(errors.featured_media_id)}
                                                    </Help>
                                                )}

                                                <Label htmlFor="tags_field">Tags</Label>
                                                <Field>
                                                    <Control expanded>
                                                        <ControlledInputTag
                                                            id="tags_field"
                                                            name="tags"
                                                            placeholder="Tags"
                                                            control={control}
                                                            color={errors.tags ? Colors.Danger : undefined}
                                                        />
                                                    </Control>
                                                </Field>
                                                {errors.tags && (
                                                    <Help color={Colors.Danger}>{extractError(errors.tags)}</Help>
                                                )}

                                                <Label htmlFor="author_users_field">Authors</Label>
                                                <Field>
                                                    <Control expanded>
                                                        <ControlledAutocompleteInputTag
                                                            id="author_users_field"
                                                            placeholder="Users"
                                                            source={userSource}
                                                            color={errors.author_user_ids ? Colors.Danger : undefined}
                                                            name="author_user_ids"
                                                            control={control}
                                                        />
                                                    </Control>
                                                </Field>
                                                {errors.author_user_ids && (
                                                    <Help color={Colors.Danger}>
                                                        {extractError(errors.author_user_ids)}
                                                    </Help>
                                                )}

                                                <Label htmlFor="publish_date_field">Publish Date</Label>
                                                <Field>
                                                    <Control expanded>
                                                        <ControlledInputDatetime
                                                            id="publish_date_field"
                                                            name="publish_date"
                                                            control={control}
                                                            color={errors.publish_date ? Colors.Danger : undefined}
                                                        />
                                                    </Control>
                                                </Field>
                                                {errors.publish_date && (
                                                    <Help color={Colors.Danger}>
                                                        {extractError(errors.publish_date)}
                                                    </Help>
                                                )}

                                                <Field>
                                                    <Control expanded>
                                                        <InputSwitch {...register("public")}>Public</InputSwitch>
                                                    </Control>
                                                </Field>
                                                <Field>
                                                    <Control expanded>
                                                        <InputSwitch {...register("listed")}>Listed</InputSwitch>
                                                    </Control>
                                                </Field>
                                                <Field>
                                                    <Control expanded>
                                                        <InputSwitch {...register("featured")}>Featured</InputSwitch>
                                                    </Control>
                                                </Field>
                                            </Fields>
                                        ),
                                    },
                                    {
                                        id: "information",
                                        label: (
                                            <>
                                                <Icon icon={faInfoCircle} fixedWidth />
                                                <span>Information</span>
                                            </>
                                        ),
                                        content: (
                                            <Fields>
                                                <Field>
                                                    <Control expanded>
                                                        <AuditMetaDetails
                                                            document={{
                                                                creation_date: watchCreationDate,
                                                                creation_user: watchCreationUser,
                                                                last_edit_date: watchLastEditDate,
                                                                last_edit_user: watchLastEditUser,
                                                            }}
                                                        />
                                                    </Control>
                                                </Field>
                                                <Label htmlFor="comment_field">Comment</Label>
                                                <Field>
                                                    <Control expanded>
                                                        <Textarea
                                                            id="comment_field"
                                                            placeholder="Comment"
                                                            rows={3}
                                                            noResize
                                                            color={errors.comment ? Colors.Danger : undefined}
                                                            {...register("comment")}
                                                        ></Textarea>
                                                    </Control>
                                                </Field>
                                                {errors.comment && (
                                                    <Help color={Colors.Danger}>{extractError(errors.comment)}</Help>
                                                )}
                                            </Fields>
                                        ),
                                    },
                                ]}
                            />
                        </Control>
                    </Field>

                    <Field grouped>
                        {!isNew && (
                            <Control>
                                <Button color={Colors.Danger} onClick={handleDelete}>
                                    <Icon icon={faTrash} fixedWidth className="media-from-sm" />
                                    <span>Delete</span>
                                </Button>
                            </Control>
                        )}

                        <Control expanded></Control>

                        <Control>
                            <Button as={Link} href={`/admin/posts`}>
                                <Icon icon={faUndo} fixedWidth className="media-from-sm" />
                                <span>Cancel</span>
                            </Button>
                        </Control>

                        <Control>
                            <Button color={Colors.Success} onClick={handleSubmit(handleSave)} disabled={isSubmitting}>
                                <Icon
                                    icon={isSubmitting ? faCircleNotch : faSave}
                                    fixedWidth
                                    spin={isSubmitting}
                                    className="media-from-sm"
                                />
                                <span>{isNew ? "Create" : "Update"}</span>
                            </Button>
                        </Control>
                    </Field>
                </Fields>
            </form>
        </>
    );
}
