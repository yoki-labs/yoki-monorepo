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
        {
            source: "/docs",
            destination: "https://www.guilded.gg/Yoki/groups/2dXLMBPd/channels/0a2069b9-2e7d-45da-9121-ab3b463f9af2/docs",
            permanent: false,
        },
        {
            source: "/feedback",
            destination: "https://www.guilded.gg/Yoki/groups/2dXLMBPd/channels/c8532cb8-fe5f-4aa9-abf8-267142c199d8/forums",
            permanent: false,
        },
        {
            source: "/invite/starboard",
            destination: "https://www.guilded.gg/b/e1ddaa4f-bdb3-45e4-b98d-ae49d6ed75b8",
            permanent: true
        }
    ],
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    compiler: {
        styledComponents: true,
    }
};

module.exports = nextConfig;
