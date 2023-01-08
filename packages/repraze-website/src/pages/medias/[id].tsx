import {GetServerSideProps} from "next";

export const getServerSideProps: GetServerSideProps = async function ({params, req, res}) {
    // const page = await Promise.resolve(`Test content ${params.id}`);
    try {
        const page = await fetch(`http://localhost:3000/api/v1/posts/${params.id}`);
        const content = (await page.json()).data.content;

        return {
            props: {
                page: content,
            },
        };
    } catch (error) {
        return {
            props: {
                page: "error",
            },
        };
    }
};

export default function Media() {
    return null;
}
