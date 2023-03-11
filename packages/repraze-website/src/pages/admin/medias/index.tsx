import {
    faCloudUploadAlt,
    faEye,
    faEyeSlash,
    faFile,
    faFilter,
    faPen,
    faPlus,
    faSearch,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";
import {ButtonDropdown} from "@repraze/lib-ui/components/button-dropdown/button-dropdown";
import {Button} from "@repraze/lib-ui/components/button/button";
import {
    DataTable,
    DataTableColumn,
    DataTableHead,
    DataTableRootView,
    DataTableSortRow,
    DataTableSortRowMethod,
    DataTableSortView,
    DataTableVirtualizedBody,
    createDataTableDateSort,
    createDataTableStringSort,
} from "@repraze/lib-ui/components/data-table/data-table";
import {
    DropdownDivider,
    DropdownGroup,
    DropdownHeading,
    DropdownItem,
} from "@repraze/lib-ui/components/dropdown/dropdown";
import {Control, Field, Fields} from "@repraze/lib-ui/components/form/field/field";
import {InputFile} from "@repraze/lib-ui/components/form/input-file/input-file";
import {Input} from "@repraze/lib-ui/components/form/input/input";
import {SelectDropdown, SelectDropdownOption} from "@repraze/lib-ui/components/form/select-dropdown/select-dropdown";
import {Select} from "@repraze/lib-ui/components/form/select/select";
import {Icon, Icons} from "@repraze/lib-ui/components/icon/icon";
import {Loader} from "@repraze/lib-ui/components/loader/loader";
import {ModalDialog, useModal} from "@repraze/lib-ui/components/modal/modal";
import {Pagination} from "@repraze/lib-ui/components/pagination/pagination";
import {Tag} from "@repraze/lib-ui/components/tag/tag";
import {Title} from "@repraze/lib-ui/components/title/title";
import {Colors, Sizes, Widths} from "@repraze/lib-ui/constants";
import {Hero} from "@repraze/lib-ui/layout/hero/hero";
import {Section} from "@repraze/lib-ui/layout/section/section";
import {Wrapper} from "@repraze/lib-ui/layout/wrapper/wrapper";
import {debounce} from "@repraze/lib-utils/timing";
import {Media} from "@repraze/website-lib/types/media";
import {MediaCategory} from "@repraze/website-lib/types/media-basic";
import {useQueryClient} from "@tanstack/react-query";
import Head from "next/head";
import Link from "next/link";
import React, {FormEventHandler, useCallback, useEffect, useMemo} from "react";

import {NoticeMessageTypes, useNoticeMessage} from "../../../components/components/notice-message";
import {UserProfile} from "../../../components/components/user-profile";
import {useMediaFilesMutation, useMedias} from "../../../components/hooks/api-hooks";
import {MEDIA_CATEGORY_TO_INFO, MediaCategoryInfo} from "../../../components/hooks/source-hooks";
import {useURLParamBoolean, useURLParamNumber, useURLParamString} from "../../../components/hooks/url-param-hook";
import {AdminLayout} from "../../../components/layouts/admin-layout";
import {useApi} from "../../../components/providers/api";
import {dateTimestampFormat} from "../../../lib/utils/date-format";
import {titleFormat} from "../../../lib/utils/meta-format";
import {bytesFormat} from "../../../lib/utils/size-format";

function getCategoryOption(value: MediaCategory | "all", info: MediaCategoryInfo): SelectDropdownOption {
    return {
        label: (
            <span className="icon-item">
                <Icon icon={info.icon} color={info.color} fixedWidth title={info.label} />
                <span>{info.label}</span>
            </span>
        ),
        id: value,
    };
}

const MEDIA_CATEGORY_OPTIONS: SelectDropdownOption[] = [
    getCategoryOption("all", {icon: faFile, label: "All"}),
    getCategoryOption("application", MEDIA_CATEGORY_TO_INFO["application"]),
    getCategoryOption("archive", MEDIA_CATEGORY_TO_INFO["archive"]),
    getCategoryOption("audio", MEDIA_CATEGORY_TO_INFO["audio"]),
    getCategoryOption("font", MEDIA_CATEGORY_TO_INFO["font"]),
    getCategoryOption("image", MEDIA_CATEGORY_TO_INFO["image"]),
    getCategoryOption("text", MEDIA_CATEGORY_TO_INFO["text"]),
    getCategoryOption("video", MEDIA_CATEGORY_TO_INFO["video"]),
    getCategoryOption("other", MEDIA_CATEGORY_TO_INFO["other"]),
];

const MEDIAS_PER_PAGE = 25;

function getMediaColumns({handleDelete}: {handleDelete: (id: string) => void}): DataTableColumn<Media>[] {
    return [
        // {
        //     id: "select",
        //     cell: () => <input type="checkbox" />,
        //     width: 50,
        //     grow: 0,
        //     align: "center",
        // },
        {
            id: "visual",
            cell: function visualCol(row) {
                const categoryInfo = MEDIA_CATEGORY_TO_INFO[row.category || "other"];
                return (
                    <Icons title={categoryInfo.label}>
                        <Icon icon={categoryInfo.icon} color={categoryInfo.color} fixedWidth />
                        {!row.public && <Icon icon={faEyeSlash} fixedWidth transform={{size: 12, x: 8, y: 8}} />}
                    </Icons>
                );
            },
            rawCell: (row) => row.category,
            width: 40,
            grow: 0,
            align: "center",
        },
        {
            id: "title",
            cell: function titleCol(row) {
                return (
                    <Link href={`/admin/medias/${row.id}`} title={`${row.id}${row.extension}`} style={{minWidth: 0}}>
                        <span className="text-narrow-line">
                            <p className="text-ellipsis">
                                <strong>{row.title}</strong>
                            </p>
                            <p>
                                <small className="text-light">
                                    {row.id}
                                    {row.extension}
                                </small>
                            </p>
                        </span>
                    </Link>
                );
            },
            rawCell: "title",
            width: 200,
            grow: 0.8,
        },
        {
            id: "size",
            cell: (row) => (row.size ? bytesFormat(row.size) : ""),
            rawCell: "size",
            width: 100,
            grow: 0,
            align: "center",
        },
        {
            id: "creation_date",
            cell: (row) => (row.creation_date ? dateTimestampFormat(row.creation_date) : ""),
            rawCell: "creation_date",
            width: 175,
            grow: 0,
            align: "right",
        },
        {
            id: "creation_user",
            cell: function creationUserCol(row) {
                return (
                    row.creation_user && (
                        <UserProfile user={row.creation_user} href={`/admin/users/${row.creation_user.username}`} />
                    )
                );
            },
            width: 200,
            grow: 0.1,
        },
        {
            id: "last_edit_date",
            cell: (row) => (row.last_edit_date ? dateTimestampFormat(row.last_edit_date) : ""),
            rawCell: "last_edit_date",
            width: 175,
            grow: 0,
            align: "right",
        },
        {
            id: "last_edit_user",
            cell: function lastEditUserCol(row) {
                return (
                    row.last_edit_user && (
                        <UserProfile user={row.last_edit_user} href={`/admin/users/${row.last_edit_user.username}`} />
                    )
                );
            },
            width: 200,
            grow: 0.1,
        },
        {
            id: "actions",
            cell: function actionsCol(row) {
                const id = row.id;
                return (
                    <>
                        <a
                            onClick={() => {
                                if (id) {
                                    handleDelete(id);
                                }
                            }}
                        >
                            <Icon icon={faTrash} fixedWidth title="Delete" />
                        </a>
                        <Link href={`/admin/medias/${row.id}`}>
                            <Icon icon={faPen} fixedWidth title="Edit" />
                        </Link>
                    </>
                );
            },
            width: 75,
            align: "right",
            grow: 0,
        },
    ];
}

const TITLES = {
    id: "ID",
    visual: "",
    title: "Title",
    size: "Size",
    creation_date: "Created At",
    creation_user: "Created By",
    last_edit_date: "Edited At",
    last_edit_user: "Edited By",
    actions: "",
};

const SORTS: {[K: string]: DataTableSortRowMethod[]} = {
    title: createDataTableStringSort(),
    creation_date: createDataTableDateSort(),
    creation_user: createDataTableStringSort(),
    last_edit_date: createDataTableDateSort(),
    last_edit_user: createDataTableStringSort(),
};

// const FILTERS: {[K: string]: ComponentType<DataTableFilterCellProps>} = {
//     id: createDataTableStringFilter({inputProps: {placeholder: "str"}}),
//     title: createDataTableStringFilter({inputProps: {placeholder: "str"}}),
//     public: createDataTableBooleanFilter(),
//     creation_date: createDataTableDateFilter(),
//     creation_user: createDataTableStringFilter({inputProps: {placeholder: "str"}}),
//     last_edit_date: createDataTableDateFilter(),
//     last_edit_user: createDataTableStringFilter({inputProps: {placeholder: "str"}}),
// };

export function MediasDropUpload() {
    const queryClient = useQueryClient();
    const {showNoticeMessage} = useNoticeMessage();

    const mediaFilesMutation = useMediaFilesMutation();

    const handleFormSubmit = useCallback<FormEventHandler<HTMLFormElement>>(async (event) => {
        event.preventDefault();
    }, []);

    const handleUpload = useCallback(
        async (files: FileList) => {
            try {
                if (files !== undefined && files.length > 0) {
                    const mediaFiles: File[] = [];
                    for (let i = 0; i < files.length; ++i) {
                        mediaFiles.push(files[i]);
                    }
                    await mediaFilesMutation.mutateAsync({files: mediaFiles});

                    queryClient.invalidateQueries({queryKey: ["medias"]});
                } else {
                    console.log("no files", files);
                }
            } catch (e) {
                if (e instanceof Error) {
                    showNoticeMessage(`Error while uploading media: ${e.message}`, NoticeMessageTypes.Error);
                } else {
                    showNoticeMessage(`Error while uploading media.`, NoticeMessageTypes.Error);
                }
            }
        },
        [queryClient]
    );

    return (
        <form onSubmit={handleFormSubmit}>
            <InputFile
                accept="image/png, image/jpeg, image/gif"
                multiple
                disabled={mediaFilesMutation.isLoading}
                dropper
                onChange={(event) => {
                    if (event.target.files) {
                        handleUpload(event.target.files);
                    }
                }}
            >
                {mediaFilesMutation.isLoading ? (
                    <>
                        <Loader fixedWidth />
                        <span>Uploading files...</span>
                    </>
                ) : (
                    <>
                        <Icon icon={faCloudUploadAlt} fixedWidth />
                        <span>Drop or choose files...</span>
                    </>
                )}
            </InputFile>
        </form>
    );
}

export default function MediasView() {
    const api = useApi();
    const queryClient = useQueryClient();

    const [page, setPage] = useURLParamNumber("page", 0);
    const [search, setSearch] = useURLParamString("search");
    const [publicFlag, setPublic] = useURLParamBoolean("public");
    const [category, setCategory] = useURLParamString("category");

    const {data, isLoading} = useMedias({
        // pagination
        limit: MEDIAS_PER_PAGE,
        skip: page * MEDIAS_PER_PAGE,
        // filter
        public: publicFlag,
        category: category as MediaCategory, // TODO: check?
        // search
        search: search,
    });

    const {showModal, clearModal} = useModal();
    const {showNoticeMessage} = useNoticeMessage();
    const handleDelete = useCallback(
        (id: string) => {
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
                                await api.delete(`medias/${id}`);
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
        },
        [queryClient]
    );

    const views = useMemo(() => {
        const columns = getMediaColumns({handleDelete});
        const rootView = new DataTableRootView(columns, []);
        // const filterView = new DataTableFilterView(rootView);
        const sortView = new DataTableSortView(rootView);
        return {
            root: rootView,
            // filter: filterView,
            sort: sortView,
            final: sortView,
        };
    }, [handleDelete]);

    const handlePageChange = useCallback(
        (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, nextPage: number) => {
            event.preventDefault();
            setPage(nextPage);
            window.scrollTo(0, 0);
        },
        [setPage]
    );

    useEffect(() => {
        views.root.setData(data?.medias || []);
        return () => {
            views.root.setData([]);
        };
    }, [data]);

    return (
        <AdminLayout>
            <Head>
                <title>{titleFormat("Medias")}</title>
            </Head>
            <Hero className="medias-title flex-none">
                <Wrapper width={Widths.Full}>
                    <Fields inline wrapped>
                        <Field>
                            <Control>
                                <Title size={1} style={{lineHeight: "2rem"}}>
                                    Medias
                                </Title>
                            </Control>
                        </Field>

                        <Field>
                            <Control>
                                <Tag size={Sizes.Large}>{data?.count} medias</Tag>
                            </Control>
                        </Field>

                        <Field expanded></Field>

                        <Field>
                            <Control>
                                <Button as={Link} color={Colors.Success} href={`/admin/medias/new`}>
                                    <Icon icon={faPlus} fixedWidth className="media-from-sm" />
                                    <span>New</span>
                                </Button>
                            </Control>
                        </Field>
                    </Fields>
                </Wrapper>
            </Hero>

            <Section className="medias-tools flex-none">
                <Wrapper width={Widths.Full}>
                    <Fields inline>
                        <Field expanded>
                            <Control expanded leftIcon={faSearch}>
                                <Input
                                    placeholder="Search"
                                    onChange={debounce(250, (e) => {
                                        const search = e.target.value;
                                        setSearch(search || undefined);
                                    })}
                                />
                            </Control>
                        </Field>

                        <Field>
                            <Control>
                                <ButtonDropdown
                                    title="Filter"
                                    right
                                    menu={
                                        <>
                                            <DropdownHeading>Filters</DropdownHeading>

                                            <DropdownGroup className="icon-item">
                                                <Icon icon={faEye} />
                                                <span>Visibility</span>
                                            </DropdownGroup>
                                            <DropdownItem>
                                                <Select
                                                    options={[
                                                        {label: "All", value: "all"},
                                                        {label: "Visible", value: "1"},
                                                        {label: "Hidden", value: "0"},
                                                    ]}
                                                    value={publicFlag === undefined ? "all" : publicFlag ? "1" : "0"}
                                                    size={Sizes.Small}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setPublic(
                                                            value === "all" ? undefined : value === "1" ? true : false
                                                        );
                                                    }}
                                                />
                                            </DropdownItem>

                                            <DropdownGroup className="icon-item">
                                                <Icon icon={faFile} />
                                                <span>Category</span>
                                            </DropdownGroup>
                                            <DropdownItem>
                                                <SelectDropdown
                                                    right
                                                    options={MEDIA_CATEGORY_OPTIONS}
                                                    value={category === undefined ? "all" : category}
                                                    size={Sizes.Small}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setCategory(value === "all" ? undefined : value);
                                                    }}
                                                    style={{minWidth: "12rem"}}
                                                />
                                            </DropdownItem>

                                            <DropdownDivider />

                                            <DropdownItem>
                                                <Button
                                                    size={Sizes.Small}
                                                    fullwidth
                                                    onClick={() => {
                                                        setPublic(undefined);
                                                        setCategory(undefined);
                                                    }}
                                                >
                                                    Clear Filters
                                                </Button>
                                            </DropdownItem>
                                        </>
                                    }
                                >
                                    <Icon icon={faFilter} fixedWidth />
                                </ButtonDropdown>
                            </Control>
                        </Field>
                    </Fields>
                </Wrapper>
            </Section>

            <Section className="medias-upload media-from-sm">
                <Wrapper width={Widths.Full}>
                    <Fields>
                        <Field>
                            <Control expanded>
                                <MediasDropUpload />
                            </Control>
                        </Field>
                    </Fields>
                </Wrapper>
            </Section>

            <Section className="medias-listing flex-1 flex">
                <Wrapper width={Widths.Full} style={{minHeight: "250px"}} className="flex-1">
                    {isLoading ? (
                        <Loader expanded />
                    ) : (
                        <DataTable expand striped hoverable style={{height: "100%", position: "relative"}}>
                            <DataTableHead view={views.final}>
                                <DataTableSortRow
                                    view={views.final}
                                    sortView={views.sort}
                                    titles={TITLES}
                                    sorts={SORTS}
                                />
                            </DataTableHead>
                            <DataTableVirtualizedBody view={views.final} innerRowHeight={32} />
                        </DataTable>
                    )}
                </Wrapper>
            </Section>

            <Section className="medias-pagination flex-none">
                <Wrapper width={Widths.Full}>
                    <Pagination
                        pageSelected={page}
                        pageRange={1}
                        itemsCount={data ? data.count : 0}
                        itemsCountPerPage={MEDIAS_PER_PAGE}
                        link={(page) => `?page=${page}`}
                        onPageClick={handlePageChange}
                    />
                </Wrapper>
            </Section>
        </AdminLayout>
    );
}
