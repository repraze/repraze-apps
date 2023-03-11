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
import {Input} from "@repraze/lib-ui/components/form/input/input";
import {Label} from "@repraze/lib-ui/components/form/label/label";
import {Textarea} from "@repraze/lib-ui/components/form/textarea/textarea";
import {Icon} from "@repraze/lib-ui/components/icon/icon";
import {ModalDialog, useModal} from "@repraze/lib-ui/components/modal/modal";
import {TabsPanel} from "@repraze/lib-ui/components/tab/tab";
import {Colors, Sizes} from "@repraze/lib-ui/constants";
import {User} from "@repraze/website-lib/types/user";
import {useQueryClient} from "@tanstack/react-query";
import Head from "next/head";
import Link from "next/link";
import {useRouter} from "next/router";
import {FormEventHandler, useCallback} from "react";
import {SubmitHandler, useForm} from "react-hook-form";
import {z} from "zod";

import {titleFormat} from "../../lib/utils/meta-format";
import {AuditMetaDetails} from "../components/audit-meta-details";
import {MarkdownEditor} from "../components/markdown-editor";
import {Markdown} from "../components/markdown/markdown";
import {MediaPreviewer} from "../components/media-previewer";
import {NoticeMessageTypes, useNoticeMessage} from "../components/notice-message";
import {useUserMutation} from "../hooks/api-hooks";
import {useHistoryBlock} from "../hooks/history-block-hook";
import {useMediaSource} from "../hooks/source-hooks";
import {useApi} from "../providers/api";
import {extractError} from "../utils/hook-form-utils";

const UserForm = User;

type UserForm = z.infer<typeof UserForm>;

function userToForm(user?: User): UserForm {
    if (user) {
        return user;
    } else {
        return {
            // fields
            username: "",
            name: "",
            email: "",
            bio: "",

            profile_media_id: null,
        };
    }
}

export interface UserEditorProps {
    user?: User;
}

export function UserEditor({user}: UserEditorProps) {
    const router = useRouter();
    const api = useApi();
    const queryClient = useQueryClient();
    const {showModal, clearModal} = useModal();
    const {showNoticeMessage} = useNoticeMessage();

    const isNew = user === undefined;
    const userUsername = !isNew ? user.username : null;

    const {
        register,
        handleSubmit,
        watch,
        formState: {isSubmitting, isDirty, errors},
        reset,
    } = useForm<UserForm>({
        mode: "onBlur",
        reValidateMode: "onChange",
        resolver: zodResolver(UserForm),
        defaultValues: userToForm(user),
    });

    const userMutation = useUserMutation();

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

    const handleSave = useCallback<SubmitHandler<UserForm>>(
        async (data) => {
            try {
                const update: User = {
                    username: data.username,
                    name: data.name,
                    email: data.email,
                    bio: data.bio,
                    profile_media_id: data.profile_media_id,

                    comment: data.comment,
                };

                const {user} = await userMutation.mutateAsync({username: userUsername, user: update});

                showNoticeMessage(isNew ? "User created." : "User saved.", NoticeMessageTypes.Success);

                if (userUsername === user.username) {
                    reset(userToForm(user));
                } else {
                    // unblock to navigate
                    unblock();
                    router.push(`/admin/users/${user.username}`);
                }

                queryClient.invalidateQueries({queryKey: ["users"]});
            } catch (e) {
                if (e instanceof Error) {
                    showNoticeMessage(
                        `Error while ${isNew ? "creating" : "saving"} user: ${e.message}`,
                        NoticeMessageTypes.Error
                    );
                } else {
                    showNoticeMessage(`Error while ${isNew ? "creating" : "saving"} user.`, NoticeMessageTypes.Error);
                }
            }
        },
        [isNew, userUsername, userMutation]
    );

    const handleDelete = useCallback(async () => {
        if (user) {
            showModal(
                <ModalDialog
                    title="Delete User"
                    text="Are you sure you want to delete this user?"
                    actions={[
                        {id: "delete", label: "Delete", color: Colors.Danger},
                        {id: "cancel", label: "Cancel"},
                    ]}
                    onAction={async (actionId) => {
                        clearModal();
                        if (actionId === "delete") {
                            try {
                                await api.delete(`users/${user.username}`);
                                unblock();
                                router.push(`/admin/users`);
                                queryClient.invalidateQueries({queryKey: ["users"]});
                                showNoticeMessage("User deleted.", NoticeMessageTypes.Success);
                            } catch (e) {
                                console.error(e);
                            }
                        }
                    }}
                    cancelable
                />
            );
        }
    }, [user]);

    const [
        watchName,
        watchBio,
        watchProfileMediaId,
        watchCreationDate,
        watchCreationUser,
        watchLastEditDate,
        watchLastEditUser,
    ] = watch([
        "name",
        "bio",
        "profile_media_id",
        "creation_date",
        "creation_user",
        "last_edit_date",
        "last_edit_user",
    ]);

    const mediaSource = useMediaSource({category: "image"});

    return (
        <>
            <Head>
                <title>{titleFormat(`${watchName ? watchName : "Unnamed User"}`)}</title>
            </Head>
            <form onSubmit={handleFormSubmit}>
                <Fields>
                    <Label htmlFor="name_field">Name</Label>
                    <Field>
                        <Control expanded>
                            <Input
                                id="name_field"
                                placeholder="Name"
                                size={Sizes.Medium}
                                color={errors.name ? Colors.Danger : undefined}
                                {...register("name")}
                                autoFocus
                            />
                        </Control>
                    </Field>
                    {errors.name && <Help color={Colors.Danger}>{extractError(errors.name)}</Help>}

                    <Label htmlFor="username_field">Username</Label>
                    <Field>
                        <Control expanded>
                            <Input
                                id="username_field"
                                placeholder="Username"
                                size={Sizes.Small}
                                {...register("username")}
                                disabled
                            />
                        </Control>
                    </Field>

                    <Field>
                        <Control expanded>
                            <TabsPanel
                                defaultTabId={"bio"}
                                tabs={[
                                    {
                                        id: "bio",
                                        label: (
                                            <>
                                                <Icon icon={faAlignLeft} fixedWidth />
                                                <span>Bio</span>
                                            </>
                                        ),
                                        content: (
                                            <Fields>
                                                <Label htmlFor="bio_field">Bio</Label>
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
                                                                            id="bio_field"
                                                                            placeholder="Bio"
                                                                            rows={16}
                                                                            color={
                                                                                errors.bio ? Colors.Danger : undefined
                                                                            }
                                                                            {...register("bio")}
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
                                                                            <Markdown>{watchBio}</Markdown>
                                                                        </div>
                                                                    ),
                                                                },
                                                            ]}
                                                        />
                                                    </Control>
                                                </Field>
                                                {errors.bio && (
                                                    <Help color={Colors.Danger}>{extractError(errors.bio)}</Help>
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
                                                <Label htmlFor="profile_media_field">Profile Media</Label>
                                                <Field>
                                                    <Control expanded>
                                                        <MediaPreviewer
                                                            size={Sizes.Small}
                                                            id={watchProfileMediaId || undefined}
                                                        />
                                                    </Control>
                                                </Field>
                                                <Field>
                                                    <Control expanded>
                                                        <InputAutocomplete
                                                            id="profile_media_field"
                                                            placeholder="Profile Media"
                                                            source={mediaSource}
                                                            color={errors.profile_media_id ? Colors.Danger : undefined}
                                                            {...register("profile_media_id", {
                                                                setValueAs: (value: string) => value || null,
                                                            })}
                                                        />
                                                    </Control>
                                                </Field>
                                                {errors.profile_media_id && (
                                                    <Help color={Colors.Danger}>
                                                        {extractError(errors.profile_media_id)}
                                                    </Help>
                                                )}
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
