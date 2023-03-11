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
import {InputSwitch} from "@repraze/lib-ui/components/form/input-switch/input-switch";
import {Input} from "@repraze/lib-ui/components/form/input/input";
import {Label} from "@repraze/lib-ui/components/form/label/label";
import {Textarea} from "@repraze/lib-ui/components/form/textarea/textarea";
import {Icon} from "@repraze/lib-ui/components/icon/icon";
import {ModalDialog, useModal} from "@repraze/lib-ui/components/modal/modal";
import {TabsPanel} from "@repraze/lib-ui/components/tab/tab";
import {Colors, Sizes} from "@repraze/lib-ui/constants";
import {Page} from "@repraze/website-lib/types/page";
import {useQueryClient} from "@tanstack/react-query";
import Head from "next/head";
import Link from "next/link";
import {useRouter} from "next/router";
import React, {FormEventHandler, useCallback, useContext} from "react";
import {SubmitHandler, useForm} from "react-hook-form";
import {z} from "zod";

import {titleFormat} from "../../lib/utils/meta-format";
import {AuditMetaDetails} from "../components/audit-meta-details";
import {MarkdownEditor} from "../components/markdown-editor";
import {Markdown} from "../components/markdown/markdown";
import {NoticeMessageTypes, useNoticeMessage} from "../components/notice-message";
import {usePageMutation} from "../hooks/api-hooks";
import {useHistoryBlock} from "../hooks/history-block-hook";
import {useApi} from "../providers/api";
import {extractError} from "../utils/hook-form-utils";

const PageForm = Page;

type PageForm = z.infer<typeof PageForm>;

function pageToForm(page?: Page): PageForm {
    if (page) {
        return page;
    } else {
        return {
            // fields
            id: "",
            title: "",
            summary: "",
            content: "",

            featured_media_id: null,
            // visibility
            public: true,
        };
    }
}

export interface PageEditorProps {
    page?: Page;
}

export function PageEditor({page}: PageEditorProps) {
    const router = useRouter();
    const api = useApi();
    const queryClient = useQueryClient();
    const {showModal, clearModal} = useModal();
    const {showNoticeMessage} = useNoticeMessage();

    const isNew = page === undefined;
    const pageId = !isNew ? page.id : null;

    const {
        register,
        handleSubmit,
        watch,
        formState: {isSubmitting, isDirty, errors},
        reset,
    } = useForm<PageForm>({
        mode: "onBlur",
        reValidateMode: "onChange",
        resolver: zodResolver(PageForm),
        defaultValues: pageToForm(page),
    });

    const pageMutation = usePageMutation();

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

    const handleSave = useCallback<SubmitHandler<PageForm>>(
        async (data) => {
            try {
                const update: Page = {
                    id: data.id,
                    title: data.title,
                    summary: data.summary,
                    content: data.content,
                    featured_media_id: data.featured_media_id,

                    public: data.public,

                    comment: data.comment,
                };

                const {page} = await pageMutation.mutateAsync({id: pageId, page: update});

                showNoticeMessage(isNew ? "Page created." : "Page saved.", NoticeMessageTypes.Success);

                if (pageId === page.id) {
                    reset(pageToForm(page));
                } else {
                    // unblock to navigate
                    unblock();
                    router.push(`/admin/pages/${page.id}`);
                }

                queryClient.invalidateQueries({queryKey: ["pages"]});
            } catch (e) {
                if (e instanceof Error) {
                    showNoticeMessage(
                        `Error while ${isNew ? "creating" : "saving"} page: ${e.message}`,
                        NoticeMessageTypes.Error
                    );
                } else {
                    showNoticeMessage(`Error while ${isNew ? "creating" : "saving"} page.`, NoticeMessageTypes.Error);
                }
            }
        },
        [isNew, pageId, pageMutation, queryClient, reset, router, showNoticeMessage, unblock]
    );

    const handleDelete = useCallback(async () => {
        if (page) {
            showModal(
                <ModalDialog
                    title="Delete Page"
                    text="Are you sure you want to delete this page?"
                    actions={[
                        {id: "delete", label: "Delete", color: Colors.Danger},
                        {id: "cancel", label: "Cancel"},
                    ]}
                    onAction={async (actionId) => {
                        clearModal();
                        if (actionId === "delete") {
                            try {
                                await api.delete(`pages/${page.id}`);
                                unblock();
                                router.push(`/admin/pages`);
                                queryClient.invalidateQueries({queryKey: ["pages"]});
                                showNoticeMessage("Page deleted.", NoticeMessageTypes.Success);
                            } catch (e) {
                                console.error(e);
                            }
                        }
                    }}
                    cancelable
                />
            );
        }
    }, [page]);

    const [watchTitle, watchContent, watchCreationDate, watchCreationUser, watchLastEditDate, watchLastEditUser] =
        watch(["title", "content", "creation_date", "creation_user", "last_edit_date", "last_edit_user"]);

    return (
        <>
            <Head>
                <title>{titleFormat(`${watchTitle ? watchTitle : "Untitled Page"}`)}</title>
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
                            <Input
                                id="id_field"
                                placeholder="Id"
                                size={Sizes.Small}
                                color={errors.id ? Colors.Danger : undefined}
                                {...register("id")}
                            />
                        </Control>
                    </Field>
                    {errors.id && <Help color={Colors.Danger}>{extractError(errors.id)}</Help>}

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
                                                        <Input
                                                            id="featured_media_field"
                                                            placeholder="Featured Media"
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

                                                <Field>
                                                    <Control>
                                                        <InputSwitch {...register("public")}>Public</InputSwitch>
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
                            <Button as={Link} href={`/admin/pages`}>
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
