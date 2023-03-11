import "@fortawesome/fontawesome-svg-core/styles.css";
import {Fira_Code, Roboto} from "@next/font/google";
import {Hydrate, QueryClient, QueryClientProvider} from "@tanstack/react-query";
import type {AppProps} from "next/app";
import Head from "next/head";
import {useEffect, useState} from "react";

import {BaseLayout} from "../components/layouts/base-layout";
import {deserializeState} from "../components/utils/state-utils";
import "../styles/app.sass";

const robotoFont = Roboto({
    variable: "--roboto-font",
    weight: ["400", "700"],
    style: ["italic", "normal"],
    subsets: ["latin"],
});

const firaCodeFont = Fira_Code({
    variable: "--fira-code-font",
    subsets: ["latin"],
});

export default function ReprazeApp({Component, pageProps}: AppProps) {
    const [queryClient] = useState(() => new QueryClient());

    useEffect(() => {
        const root = document.getElementById("__next");
        if (root) {
            root.classList.add("app", "app-full-size", robotoFont.variable, firaCodeFont.variable);
            return () =>
                document.body.classList.remove("app", "app-full-size", robotoFont.variable, firaCodeFont.variable);
        }
    }, []);

    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="shortcut icon" type="image/png" href="/static/favicon.png" />
                <link rel="shortcut icon" type="image/x-icon" href="/static/favicon.ico" />
            </Head>
            <QueryClientProvider client={queryClient}>
                <Hydrate state={deserializeState(pageProps?.dehydratedState)}>
                    <BaseLayout>
                        <Component {...pageProps} />
                    </BaseLayout>
                </Hydrate>
            </QueryClientProvider>
        </>
    );
}
