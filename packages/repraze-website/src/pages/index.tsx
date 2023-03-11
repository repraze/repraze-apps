import {Inter} from "@next/font/google";
import {Button} from "@repraze/lib-ui/components/button/button";
import {Content} from "@repraze/lib-ui/components/content/content";
import {Section} from "@repraze/lib-ui/layout/section/section";
import {Wrapper} from "@repraze/lib-ui/layout/wrapper/wrapper";
import Head from "next/head";

import {AppLayout} from "../components/layouts/app-layout";

export default function HomeView() {
    return (
        <AppLayout>
            <Head>
                <title>Repraze</title>
            </Head>
            <Section>
                <Wrapper>
                    <Content>
                        <h1>Home</h1>
                        <p>
                            Lorem ipsum dolor sit amet, <b>consectetur adipiscing</b> elit. Morbi at mollis est. Nullam
                            consectetur urna at velit bibendum pretium. Nam sed ultricies magna. Donec interdum lorem
                            eget commodo viverra. Morbi malesuada magna nunc, id cursus odio facilisis ultrices.
                            Praesent mollis urna scelerisque lacinia sollicitudin. Lorem ipsum dolor sit amet,
                            consectetur adipiscing elit. Fusce eu urna id velit pulvinar sodales at id enim. Nullam
                            augue metus, <i>malesuada et dignissim</i> ut, accumsan quis tellus.
                        </p>
                        <p>
                            Proin id est vel lectus elementum auctor in in ligula. Ut tincidunt gravida leo et tempor.
                            Sed feugiat mi sit amet ante semper semper. <u>Etiam finibus</u> enim laoreet, pellentesque
                            est eget, elementum tellus. Aliquam interdum augue nec eros porttitor hendrerit. Nunc
                            sagittis nisl vitae lacinia vestibulum. Duis convallis arcu ipsum, eget aliquam risus
                            tincidunt vitae. Etiam in mattis odio. Donec magna dolor, eleifend et pulvinar id, aliquam
                            ut tortor.
                        </p>
                        <p>
                            <i>
                                <b>Sed venenatis luctus nulla</b>
                            </i>{" "}
                            et tincidunt. Nullam sit amet bibendum arcu. Cras vel diam nec augue pulvinar egestas ut sit
                            amet sem. Phasellus vitae neque fringilla, dignissim turpis eget, blandit nulla. Duis libero
                            diam, pharetra vitae nisl sed, posuere sagittis est. Duis nulla orci, malesuada nec bibendum
                            sed, commodo vitae turpis. Class aptent taciti sociosqu ad litora torquent per conubia
                            nostra, per inceptos himenaeos. Nunc sem velit, suscipit non orci in, rhoncus viverra dui.
                            Nunc egestas vel orci a dictum.
                        </p>
                        <p>
                            Ut tincidunt nunc ac ipsum viverra venenatis. Maecenas at nulla rutrum, pulvinar velit ac,
                            lacinia felis. Vivamus ac metus rutrum, faucibus quam eu, ultricies augue. Suspendisse
                            vulputate dictum porttitor. Nunc ut urna diam. Sed vestibulum orci nec lorem finibus, a
                            rhoncus massa mollis. Fusce ullamcorper, velit ut rhoncus pellentesque, urna odio rutrum
                            purus, mattis volutpat ipsum arcu ac dolor. Praesent bibendum augue eu enim vulputate
                            posuere. Morbi eget nisi efficitur, mattis libero ut, tempus arcu. Nulla ultrices imperdiet
                            tellus, non pulvinar urna laoreet a. Maecenas ex est, feugiat a auctor eu, tincidunt eu sem.
                            Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae;
                        </p>
                    </Content>
                </Wrapper>
            </Section>
        </AppLayout>
    );
}
