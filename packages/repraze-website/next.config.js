/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    async headers() {
        return [
            {
                source: "/(.*?)",
                headers: [
                    {
                        key: "x-powered-by",
                        value: "Repraze",
                    },
                ],
            },
        ];
    },
    async rewrites() {
        return [
            {
                source: "/medias/:filename*",
                destination: "/api/medias/:filename*",
            },
        ];
    },
    transpilePackages: ["@repraze/lib-utils", "@repraze/lib-ui"],
};

module.exports = nextConfig;
