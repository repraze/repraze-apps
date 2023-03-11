import {Loader} from "@repraze/lib-ui/components/loader/loader";
import {Sizes} from "@repraze/lib-ui/constants";
import {Section} from "@repraze/lib-ui/layout/section/section";
import {Wrapper} from "@repraze/lib-ui/layout/wrapper/wrapper";
import Head from "next/head";
import {useEffect} from "react";

import {titleFormat} from "../../lib/utils/meta-format";

export function LoadingView() {
    useEffect(() => {
        document.body.classList.add("loader-container");
        return () => document.body.classList.remove("loader-container");
    }, []);

    return (
        <>
            <Head>
                <title>{titleFormat("Loading")}</title>
            </Head>
            <Section>
                <Wrapper className="expanded" style={{minHeight: "250px"}}>
                    <Loader expanded size={Sizes.Large} />
                </Wrapper>
            </Section>
        </>
    );
}
