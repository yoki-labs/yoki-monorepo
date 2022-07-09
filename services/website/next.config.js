/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    redirects: async () => [
        {
            source: "/invite",
            destination: "https://guilded.gg/b/7af0dd87-f6c8-43b1-b1bb-8917c82d5cfd",
            permanent: true,
        },
        {
            source: "/support",
            destination: "https://www.guilded.gg/Yoki?i=pmbOB8VA",
            permanent: true,
        },
        {
            source: "/premium",
            destination: "https://www.guilded.gg/Yoki/subscriptions",
            permanent: true,
        },
    ],
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
};

module.exports = nextConfig;
