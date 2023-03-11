import {
    faCircleNotch,
    faFile,
    faInfoCircle,
    faSave,
    faSlidersH,
    faTrash,
    faUndo,
} from "@fortawesome/free-solid-svg-icons";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "@repraze/lib-ui/components/button/button";
import {Control, Field, Fields} from "@repraze/lib-ui/components/form/field/field";
import {Help} from "@repraze/lib-ui/components/form/help/help";
import {InputFile} from "@repraze/lib-ui/components/form/input-file/input-file";
import {InputSwitch} from "@repraze/lib-ui/components/form/input-switch/input-switch";
import {Input} from "@repraze/lib-ui/components/form/input/input";
import {Label} from "@repraze/lib-ui/components/form/label/label";
import {Textarea} from "@repraze/lib-ui/components/form/textarea/textarea";
import {Icon} from "@repraze/lib-ui/components/icon/icon";
import {ModalDialog, useModal} from "@repraze/lib-ui/components/modal/modal";
import {TabsPanel} from "@repraze/lib-ui/components/tab/tab";
import {Colors, Sizes} from "@repraze/lib-ui/constants";
import {Media} from "@repraze/website-lib/types/media";
import {useQueryClient} from "@tanstack/react-query";
import Head from "next/head";
import Link from "next/link";
import {useRouter} from "next/router";
import {FormEventHandler, useCallback} from "react";
import {SubmitHandler, useForm} from "react-hook-form";
import {z} from "zod";

import {titleFormat} from "../../lib/utils/meta-format";
import {AuditMetaDetails} from "../components/audit-meta-details";
import {MediaPreviewer} from "../components/media-previewer";
import {NoticeMessageTypes, useNoticeMessage} from "../components/notice-message";
import {useMediaMutation} from "../hooks/api-hooks";
import {useHistoryBlock} from "../hooks/history-block-hook";
import {useApi} from "../providers/api";
import {extractError} from "../utils/hook-form-utils";

function firstFileFileList(value: unknown) {
    if (value instanceof FileList) {
        if (value.length === 1) {
            return value[0];
        } else {
            return undefined;
        }
    }
    return value;
}

const NewMediaForm = Media.extend({
    file: z.preprocess(firstFileFileList, z.instanceof(File, "Should select one file")),
});

const MediaForm = Media.extend({
    file: z.preprocess(firstFileFileList, z.optional(z.instanceof(File, "Should select one file"))),
});

type MediaForm = z.infer<typeof MediaForm>;

function mediaToForm(media?: Media): MediaForm {
    if (media) {
        return {...media, file: undefined};
    } else {
        return {
            // fields
            id: null,
            title: "",
            summary: "",
            mime_type: null,
            extension: null,
            category: null,
            size: null,
            file: undefined,
            // visibility
            public: true,
        };
    }
}

export interface MediaEditorProps {
    media?: Media;
}

export function MediaEditor({media}: MediaEditorProps) {
    const router = useRouter();
    const api = useApi();
    const queryClient = useQueryClient();
    const {showModal, clearModal} = useModal();
    const {showNoticeMessage} = useNoticeMessage();

    const isNew = media === undefined;
    const mediaId = !isNew ? media.id : null;

    const {
        register,
        handleSubmit,
        watch,
        formState: {isSubmitting, isDirty, errors},
        reset,
    } = useForm<MediaForm>({
        mode: "onBlur",
        reValidateMode: "onChange",
        resolver: zodResolver(isNew ? NewMediaForm : MediaForm),
        defaultValues: mediaToForm(media),
    });

    const mediaMutation = useMediaMutation();

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

    const handleSave = useCallback<SubmitHandler<MediaForm>>(
        async (data) => {
            try {
                const update: Media = {
                    id: data.id,
                    title: data.title,
                    summary: data.summary,
                    mime_type: null,
                    extension: null,
                    category: null,
                    size: null,

                    public: data.public,

                    comment: data.comment,
                };

                const fileUpdate = data.file;

                const {media} = await mediaMutation.mutateAsync({id: mediaId, media: update, file: fileUpdate});

                showNoticeMessage(isNew ? "Media created." : "Media saved.", NoticeMessageTypes.Success);

                if (mediaId === media.id) {
                    reset(mediaToForm(media));
                } else {
                    // unblock to navigate
                    unblock();
                    router.push(`/admin/medias/${media.id}`);
                }

                queryClient.invalidateQueries({queryKey: ["medias"]});
            } catch (e) {
                if (e instanceof Error) {
                    showNoticeMessage(
                        `Error while ${isNew ? "creating" : "saving"} media: ${e.message}`,
                        NoticeMessageTypes.Error
                    );
                } else {
                    showNoticeMessage(`Error while ${isNew ? "creating" : "saving"} media.`, NoticeMessageTypes.Error);
                }
            }
        },
        [isNew, mediaId, mediaMutation]
    );

    const handleDelete = useCallback(() => {
        if (media) {
            showModal(
                <ModalDialog
                    title="Delete Media"
                    text="Are you sure you want to delete this media?"
                    actions={[
                        {id: "delete", label: "Delete", color: Colors.Danger},
                        {id: "cancel", label: "Cancel"},
                    ]}
                    onAction={async (actionId) => {
                        clearModal();
                        if (actionId === "delete") {
                            try {
                                await api.delete(`medias/${media.id}`);
                                unblock();
                                router.push(`/admin/medias`);
                                queryClient.invalidateQueries({queryKey: ["medias"]});
                                showNoticeMessage("Media deleted.", NoticeMessageTypes.Success);
                            } catch (e) {
                                console.error(e);
                            }
                        }
                    }}
                    cancelable
                />
            );
        }
    }, [media]);

    const [watchTitle, watchCreationDate, watchCreationUser, watchLastEditDate, watchLastEditUser] = watch([
        "title",
        "creation_date",
        "creation_user",
        "last_edit_date",
        "last_edit_user",
    ]);

    return (
        <>
            <Head>
                <title>{titleFormat(`${watchTitle ? watchTitle : "Untitled Media"}`)}</title>
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
                                defaultTabId={"file"}
                                tabs={[
                                    {
                                        id: "file",
                                        label: (
                                            <>
                                                <Icon icon={faFile} fixedWidth />
                                                <span>File</span>
                                            </>
                                        ),
                                        content: (
                                            <Fields>
                                                <Label>Preview</Label>
                                                <Field>
                                                    <Control expanded>
                                                        <MediaPreviewer
                                                            size={Sizes.Large}
                                                            id={media?.id || undefined}
                                                        />
                                                    </Control>
                                                </Field>

                                                <Label htmlFor="file_field">File</Label>
                                                <Field>
                                                    <Control expanded>
                                                        <InputFile
                                                            id="file_field"
                                                            color={errors.file ? Colors.Danger : undefined}
                                                            {...register("file")}
                                                        >
                                                            {isNew ? "Select file..." : "Update file..."}
                                                        </InputFile>
                                                    </Control>
                                                </Field>
                                                {errors.file && (
                                                    <Help color={Colors.Danger}>{extractError(errors.file)}</Help>
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
