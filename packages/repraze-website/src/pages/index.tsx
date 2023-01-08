import {Inter} from "@next/font/google";
import {Button} from "@repraze/lib-ui/components/button/button";
import Head from "next/head";
import Image from "next/image";

export default function Home() {
    return (
        <>
            <Head>
                <title>Repraze</title>
            </Head>
            <p>hello world</p>
            <Image
                src="/medias/ydGE35nCuwI4vnEcRhTSC.jpg"
                alt="test image"
                width={950}
                height={200}
                style={{display: "block", width: "200px", height: "200px", objectFit: "cover"}}
            />
        </>
    );
}
