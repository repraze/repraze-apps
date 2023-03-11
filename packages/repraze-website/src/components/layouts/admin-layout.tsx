import {
    faAdjust,
    faBars,
    faFileAlt,
    faFolder,
    faPen,
    faSearch,
    faSignOutAlt,
    faThLarge,
    faTimes,
    faUsers,
} from "@fortawesome/free-solid-svg-icons";
import {Button} from "@repraze/lib-ui/components/button/button";
import {Control, Field} from "@repraze/lib-ui/components/form/field/field";
import {Input} from "@repraze/lib-ui/components/form/input/input";
import {Icon} from "@repraze/lib-ui/components/icon/icon";
import {MenuItems} from "@repraze/lib-ui/components/menu/menu";
import {Colors, Sizes} from "@repraze/lib-ui/constants";
import {Drawer, DrawerMenu} from "@repraze/lib-ui/layout/drawer/drawer";
import {Flex, FlexDirection} from "@repraze/lib-ui/layout/flex/flex";
import {NavMenu, Navbar} from "@repraze/lib-ui/layout/navbar/navbar";
import Link from "next/link";
import {useRouter} from "next/router";
import {HTMLAttributes, ReactNode, useCallback, useEffect, useState} from "react";

import {UserProfilePicture} from "../components/user-profile";
import {useCurrentUser} from "../hooks/api-hooks";
import {ReprazeLogo} from "../logos/repraze-logo";
import {useApi} from "../providers/api";
import {useTheme} from "../providers/theme";
import {ThemeModes} from "../providers/theme/theme-provider";

const ADMIN_ROOT = "/admin";

const MENU_ITEMS: MenuItems<HTMLAttributes<HTMLElement>> = [
    {
        id: "dashboard",
        label: (
            <span className="icon-item">
                <Icon icon={faThLarge} fixedWidth />
                <span>Dashboard</span>
            </span>
        ),
        link: `${ADMIN_ROOT}/`,
    },
    {
        id: "posts",
        label: (
            <span className="icon-item">
                <Icon icon={faPen} fixedWidth />
                <span>Posts</span>
            </span>
        ),
        link: `${ADMIN_ROOT}/posts`,
    },
    {
        id: "pages",
        label: (
            <span className="icon-item">
                <Icon icon={faFileAlt} fixedWidth />
                <span>Pages</span>
            </span>
        ),
        link: `${ADMIN_ROOT}/pages`,
    },
    // {
    //     id: "projects",
    //     label: (
    //         <span className="icon-item">
    //             <Icon icon={faLayerGroup} fixedWidth />
    //             <span>Projects</span>
    //         </span>
    //     ),
    //     link: `${PATH_ROOT}/projects`,
    // },
    {
        id: "medias",
        label: (
            <span className="icon-item">
                <Icon icon={faFolder} fixedWidth />
                <span>Medias</span>
            </span>
        ),
        link: `${ADMIN_ROOT}/medias`,
    },
    {
        id: "users",
        label: (
            <span className="icon-item">
                <Icon icon={faUsers} fixedWidth />
                <span>Users</span>
            </span>
        ),
        link: `${ADMIN_ROOT}/users`,
    },
];

function isWideScreen() {
    return window.innerWidth >= 768;
}

interface AdminHeaderProps {
    menu: MenuItems<HTMLAttributes<HTMLElement>>;
}

function AdminHeader({menu}: AdminHeaderProps) {
    const theme = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        setIsMenuOpen(isWideScreen() ? true : false);
        return () => {
            setIsMenuOpen(false);
        };
    }, []);

    useEffect(() => {
        document.body.classList.add("fixed-navbar");
        return () => document.body.classList.remove("fixed-navbar");
    }, []);

    const toggleThemeHandler = useCallback(() => {
        const mode = theme.mode;
        if (mode === ThemeModes.Light) {
            theme.setMode(ThemeModes.Dark);
        } else {
            theme.setMode(ThemeModes.Light);
        }
    }, [theme]);
    const toggleMenuHandler = useCallback(() => {
        if (isMenuOpen) {
            setIsMenuOpen(false);
            document.body.classList.remove("no-scroll-until-md");
        } else {
            setIsMenuOpen(true);
            document.body.classList.add("no-scroll-until-md");
        }
    }, [isMenuOpen, setIsMenuOpen]);
    const closeMenuSmallScreenHandler = useCallback(() => {
        if (!isWideScreen()) {
            setIsMenuOpen(false);
            document.body.classList.remove("no-scroll-until-md");
        }
    }, [setIsMenuOpen]);

    const {data} = useCurrentUser();
    const api = useApi();
    return (
        <>
            <Navbar aria-label="primary" fixed>
                <div className="navbar-start">
                    <Button
                        className="navbar-button"
                        size={Sizes.Medium}
                        color={Colors.Transparent}
                        onClick={toggleMenuHandler}
                    >
                        <Icon icon={isMenuOpen ? faTimes : faBars} fixedWidth />
                    </Button>
                    <div className="media-from-md navbar-brand">
                        <Link className="navbar-item" href="/">
                            <ReprazeLogo />
                        </Link>
                    </div>
                </div>
                {data?.user && (
                    <div className="navbar-end">
                        <NavMenu
                            items={[
                                {
                                    id: "user",
                                    label: (
                                        <>
                                            <UserProfilePicture
                                                user={data.user}
                                                size={Sizes.Normal}
                                                className="icon-like"
                                            />
                                            <span
                                                style={{
                                                    maxWidth: "125px",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                }}
                                            >
                                                {data.user.name}
                                            </span>
                                        </>
                                    ),
                                    items: [
                                        {
                                            id: "logout",
                                            label: (
                                                <>
                                                    <Icon icon={faSignOutAlt} fixedWidth />
                                                    <span>Logout</span>
                                                </>
                                            ),
                                            props: {
                                                className: "icon-item",
                                                onClick: () => {
                                                    api.unauthenticate();
                                                },
                                            },
                                        },
                                    ],
                                    props: {className: "icon-item"},
                                },
                            ]}
                        />
                    </div>
                )}
            </Navbar>
            <Drawer open={isMenuOpen} className="left-side">
                <div className="drawer-top">
                    <Field>
                        <Control leftIcon={faSearch} expanded>
                            <Input placeholder="Search" />
                        </Control>
                    </Field>
                </div>
                <div className="drawer-content">
                    <DrawerMenu items={menu} onItemClick={closeMenuSmallScreenHandler} />
                </div>
                <div className="drawer-bottom">
                    <Field>
                        <Control expanded>
                            <Button className="navbar-button" onClick={toggleThemeHandler} fullwidth>
                                <Icon icon={faAdjust} fixedWidth />
                                <span>Toggle Theme</span>
                            </Button>
                        </Control>
                    </Field>
                </div>
            </Drawer>
        </>
    );
}

function AdminFooter() {
    return <></>;
}

export interface AdminAppContainerProps {
    menu: MenuItems<HTMLAttributes<HTMLElement>>;
    children: ReactNode;
}

export function AdminAppContainer({menu, children}: AdminAppContainerProps) {
    return (
        <>
            <AdminHeader menu={menu} />
            <Flex direction={FlexDirection.Column} className="app-main-content side-drawer-left">
                {children}
            </Flex>
            <AdminFooter />
        </>
    );
}

export interface AdminLayoutProps {
    children?: ReactNode;
}

export function AdminLayout({children}: AdminLayoutProps) {
    const {isAuthenticating, isAuthenticated} = useApi();
    const router = useRouter();
    const [calledPush, setCalledPush] = useState(false);

    useEffect(() => {
        if (!isAuthenticating && !isAuthenticated && !calledPush) {
            router.push(`${ADMIN_ROOT}/sign-in`);
            setCalledPush(true);
        }
    }, [router, calledPush, isAuthenticating, isAuthenticated]);

    return !isAuthenticating && isAuthenticated ? (
        <AdminAppContainer menu={MENU_ITEMS}>{children}</AdminAppContainer>
    ) : (
        <></>
    );
}
