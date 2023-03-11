import {faPen, faPlus, faSearch, faTrash} from "@fortawesome/free-solid-svg-icons";
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
import {Control, Field, Fields} from "@repraze/lib-ui/components/form/field/field";
import {Input} from "@repraze/lib-ui/components/form/input/input";
import {Icon} from "@repraze/lib-ui/components/icon/icon";
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
import {User} from "@repraze/website-lib/types/user";
import {useQueryClient} from "@tanstack/react-query";
import Head from "next/head";
import Link from "next/link";
import React, {useCallback, useEffect, useMemo} from "react";

import {NoticeMessageTypes, useNoticeMessage} from "../../../components/components/notice-message";
import {UserProfile, UserProfilePicture} from "../../../components/components/user-profile";
import {useUsers} from "../../../components/hooks/api-hooks";
import {useURLParamNumber, useURLParamString} from "../../../components/hooks/url-param-hook";
import {AdminLayout} from "../../../components/layouts/admin-layout";
import {useApi} from "../../../components/providers/api";
import {dateTimestampFormat} from "../../../lib/utils/date-format";
import {titleFormat} from "../../../lib/utils/meta-format";

const USERS_PER_PAGE = 25;

function getUserColumns({handleDelete}: {handleDelete: (id: string) => void}): DataTableColumn<User>[] {
    return [
        {
            id: "visual",
            cell: function visualCol(row) {
                // return <Icon icon={faUser} color={Colors.Primary} fixedWidth title="User" />;
                return <UserProfilePicture user={row} size={Sizes.Normal} style={{flexShrink: 0}} />;
            },
            rawCell: (row) => undefined,
            width: 40,
            grow: 0,
            align: "center",
        },
        {
            id: "name",
            cell: function titleCol(row) {
                return (
                    <Link href={`/admin/users/${row.username}`} title={row.username} style={{minWidth: 0}}>
                        <span className="text-narrow-line">
                            <p className="text-ellipsis">
                                <strong>{row.name}</strong>
                            </p>
                            <p>
                                <small className="text-light">{row.username}</small>
                            </p>
                        </span>
                    </Link>
                );
            },
            rawCell: "name",
            width: 200,
            grow: 0.8,
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
                const username = row.username;
                return (
                    <>
                        <a
                            onClick={() => {
                                if (username) {
                                    handleDelete(username);
                                }
                            }}
                        >
                            <Icon icon={faTrash} fixedWidth title="Delete" />
                        </a>
                        <Link href={`/admin/users/${row.username}`}>
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
    name: "Name",
    creation_date: "Created At",
    creation_user: "Created By",
    last_edit_date: "Edited At",
    last_edit_user: "Edited By",
    actions: "",
};

const SORTS: {[K: string]: DataTableSortRowMethod[]} = {
    name: createDataTableStringSort(),
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

export default function UsersView() {
    const api = useApi();
    const queryClient = useQueryClient();

    const [page, setPage] = useURLParamNumber("page", 0);
    const [search, setSearch] = useURLParamString("search");

    const {data, isLoading} = useUsers({
        // pagination
        limit: USERS_PER_PAGE,
        skip: page * USERS_PER_PAGE,
        // search
        search: search,
    });

    const {showModal, clearModal} = useModal();
    const {showNoticeMessage} = useNoticeMessage();
    const handleDelete = useCallback(
        (username: string) => {
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
                                await api.delete(`users/${username}`);
                                queryClient.invalidateQueries({queryKey: ["uses"]});
                                showNoticeMessage("User deleted.", NoticeMessageTypes.Success);
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
        const columns = getUserColumns({handleDelete});
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
        views.root.setData(data?.users || []);
        return () => {
            views.root.setData([]);
        };
    }, [data]);

    return (
        <AdminLayout>
            <Head>
                <title>{titleFormat("Users")}</title>
            </Head>
            <Hero className="users-title flex-none">
                <Wrapper width={Widths.Full}>
                    <Fields inline wrapped>
                        <Field>
                            <Control>
                                <Title size={1} style={{lineHeight: "2rem"}}>
                                    Users
                                </Title>
                            </Control>
                        </Field>

                        <Field>
                            <Control>
                                <Tag size={Sizes.Large}>{data?.count} users</Tag>
                            </Control>
                        </Field>

                        <Field expanded></Field>

                        <Field>
                            <Control>
                                <Button as={Link} color={Colors.Success} href={`/admin/users/new`}>
                                    <Icon icon={faPlus} fixedWidth className="media-from-sm" />
                                    <span>New</span>
                                </Button>
                            </Control>
                        </Field>
                    </Fields>
                </Wrapper>
            </Hero>

            <Section className="users-tools flex-none">
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
                    </Fields>
                </Wrapper>
            </Section>

            <Section className="users-listing flex-1 flex">
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
                            <DataTableVirtualizedBody view={views.final} innerRowHeight={32}></DataTableVirtualizedBody>
                        </DataTable>
                    )}
                </Wrapper>
            </Section>

            <Section className="users-pagination flex-none">
                <Wrapper width={Widths.Full}>
                    <Pagination
                        pageSelected={page}
                        pageRange={1}
                        itemsCount={data ? data.count : 0}
                        itemsCountPerPage={USERS_PER_PAGE}
                        link={(page) => `?page=${page}`}
                        onPageClick={handlePageChange}
                    />
                </Wrapper>
            </Section>
        </AdminLayout>
    );
}
