import type {AppProps} from "next/app";

import "../styles/app.sass";
import "../styles/globals.css";

export default function ReprazeApp({Component, pageProps}: AppProps) {
    return <Component {...pageProps} />;
}
