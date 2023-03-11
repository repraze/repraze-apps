import {faInstagram, faTwitch, faTwitter, faYoutube} from "@fortawesome/free-brands-svg-icons";
import {faAdjust, faArrowUpRightFromSquare, faBars, faSearch, faTimes} from "@fortawesome/free-solid-svg-icons";
import {Button} from "@repraze/lib-ui/components/button/button";
import {Control, Field} from "@repraze/lib-ui/components/form/field/field";
import {Input} from "@repraze/lib-ui/components/form/input/input";
import {Icon} from "@repraze/lib-ui/components/icon/icon";
import {MenuItems} from "@repraze/lib-ui/components/menu/menu";
import {Title} from "@repraze/lib-ui/components/title/title";
import {Colors, Sizes} from "@repraze/lib-ui/constants";
import {Drawer, DrawerMenu} from "@repraze/lib-ui/layout/drawer/drawer";
import {Footer} from "@repraze/lib-ui/layout/footer/footer";
import {Grid, GridCell} from "@repraze/lib-ui/layout/grid/grid";
import {NavMenu, Navbar} from "@repraze/lib-ui/layout/navbar/navbar";
import {Section} from "@repraze/lib-ui/layout/section/section";
import {Wrapper} from "@repraze/lib-ui/layout/wrapper/wrapper";
import {Random} from "@repraze/lib-utils/random";
import Link from "next/link";
import {HTMLAttributes, ReactNode, useCallback, useEffect, useState} from "react";

import {ReprazeLogo} from "../logos/repraze-logo";
import {useApi} from "../providers/api";
import {useTheme} from "../providers/theme";
import {ThemeModes} from "../providers/theme/theme-provider";

const SOCIAL_MENU: MenuItems<HTMLAttributes<HTMLElement>> = [
    {
        id: "youtube",
        label: (
            <>
                <Icon icon={faYoutube} fixedWidth />
                <span className="flex-1">Youtube</span>
                <Icon icon={faArrowUpRightFromSquare} fixedWidth />
            </>
        ),
        link: "https://www.youtube.com/user/Repraze",
        props: {className: "icon-item flex row"},
    },
    {
        id: "twitter",
        label: (
            <>
                <Icon icon={faTwitter} fixedWidth />
                <span className="flex-1">Twitter</span>
                <Icon icon={faArrowUpRightFromSquare} fixedWidth />
            </>
        ),
        link: "https://twitter.com/repraze",
        props: {className: "icon-item flex row"},
    },
    {
        id: "instagram",
        label: (
            <>
                <Icon icon={faInstagram} fixedWidth />
                <span className="flex-1">Instagram</span>
                <Icon icon={faArrowUpRightFromSquare} fixedWidth />
            </>
        ),
        link: "https://www.instagram.com/repraze/",
        props: {className: "icon-item flex row"},
    },
    {
        id: "twitch",
        label: (
            <>
                <Icon icon={faTwitch} fixedWidth />
                <span className="flex-1">Twitch</span>
                <Icon icon={faArrowUpRightFromSquare} fixedWidth />
            </>
        ),
        link: "https://www.twitch.tv/reprazelive",
        props: {className: "icon-item flex row"},
    },
];

const MENU_ITEMS: MenuItems<HTMLAttributes<HTMLElement>> = [
    {
        id: "posts",
        label: "Posts",
        link: "/posts",
    },
    // {
    //     id: "projects",
    //     label: "Project",
    //     link: "/projects",
    // },
    {
        id: "social",
        label: <span>Social</span>,
        items: SOCIAL_MENU,
        props: {className: "icon-item"},
    },
];

function AppHeader() {
    const theme = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        document.body.classList.add("fixed-navbar");
        return () => document.body.classList.remove("fixed-navbar");
    }, []);

    const toggleThemeHandler = useCallback(() => {
        if (theme.mode === ThemeModes.Light) {
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
    }, [isMenuOpen]);
    return (
        <>
            <Navbar aria-label="primary" fixed>
                <div className="navbar-start">
                    <Button
                        className="media-until-md navbar-button"
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
                    <NavMenu className="media-from-md" items={MENU_ITEMS} />
                </div>
                <div className="media-until-md navbar-brand navbar-middle">
                    <Link className="navbar-item" href="/">
                        <ReprazeLogo />
                    </Link>
                </div>
                <div className="navbar-end">
                    <div className="media-from-md navbar-item">
                        <Field>
                            <Control leftIcon={faSearch}>
                                <Input placeholder="Search" size={Sizes.Small} />
                            </Control>
                        </Field>
                    </div>
                    <Button
                        className="navbar-button"
                        size={Sizes.Medium}
                        color={Colors.Transparent}
                        onClick={toggleThemeHandler}
                    >
                        <Icon icon={faAdjust} fixedWidth />
                    </Button>
                </div>
            </Navbar>
            <Drawer className="media-until-md" open={isMenuOpen}>
                <div className="drawer-top">
                    <Field>
                        <Control leftIcon={faSearch} expanded>
                            <Input placeholder="Search" />
                        </Control>
                    </Field>
                </div>
                <div className="drawer-content">
                    <DrawerMenu items={MENU_ITEMS} />
                </div>
            </Drawer>
        </>
    );
}

function AppFooter() {
    const currentYear = new Date().getFullYear();
    const [quote, setQuote] = useState("");

    useEffect(
        () =>
            setQuote(
                Random.default().item([
                    "Love your creation",
                    "Easter Egg",
                    "Keep on making",
                    "Drink water",
                    "Wake up, Neo...",
                    "Time to get some rest",
                ])
            ),
        []
    );

    return (
        <Footer>
            <Section>
                <Wrapper>
                    <Grid className="cols-4">
                        <GridCell className="col-span-2 md-col-span-1">
                            <Title size={6}>Site Map</Title>
                            <ul>
                                <li>Home</li>
                                <li>Posts</li>
                                <li>Pages</li>
                            </ul>
                        </GridCell>
                        <GridCell className="col-span-2 md-col-span-1">
                            <Title size={6}>Group</Title>
                            <ul>
                                <li>About</li>
                                <li>Partners & Sponsors</li>
                                <li>Media Kit</li>
                                <li>Terms of use</li>
                            </ul>
                        </GridCell>
                        <GridCell className="col-span-2 md-col-span-1">
                            <Title size={6}>Community</Title>
                            <ul>
                                <li>Newsletter</li>
                                <li>RSS</li>
                                <li>Support</li>
                            </ul>
                        </GridCell>
                        <GridCell className="col-span-2 md-col-span-1">
                            <Title size={6}>Social</Title>
                            <ul>
                                {SOCIAL_MENU.map((item) => (
                                    <li key={item.id}>
                                        <a href={item.link} {...item.props}>
                                            {item.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </GridCell>
                    </Grid>
                </Wrapper>
            </Section>
            <Section>
                <Wrapper>
                    <Grid className="cols-2">
                        <GridCell className="footer-mark">© {currentYear} Thomas Dubosc</GridCell>
                        <GridCell className="footer-quote">{quote}</GridCell>
                    </Grid>
                </Wrapper>
            </Section>
        </Footer>
    );
}

export interface AppContainerProps {
    children: ReactNode;
}

export function AppContainer({children}: AppContainerProps) {
    const {isAuthenticating, isAuthenticated} = useApi();

    return (
        <>
            <AppHeader />
            <div className="app-main-content">{children}</div>
            <AppFooter />
        </>
    );
}

export interface AppLayoutProps {
    children?: ReactNode;
}

export function AppLayout({children}: AppLayoutProps) {
    return <AppContainer>{children}</AppContainer>;
}
