// Injected content via Sentry wizard below
const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
	{
		reactStrictMode: true,
		images: {
			domains: ["s3-us-west-2.amazonaws.com", "img.guildedcdn.com"],
		},
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
				source: "/subscribe",
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
		],
		eslint: {
			// Warning: This allows production builds to successfully complete even if
			// your project has ESLint errors.
			ignoreDuringBuilds: true,
		},
		compiler: {
			styledComponents: true,
		},
	},
	{
		// For all available options, see:
		// https://github.com/getsentry/sentry-webpack-plugin#options

		// Suppresses source map uploading logs during build
		silent: true,
		org: "yoki-labs-er",
		project: "yoki-dash",
	},
	// {
	// 	// For all available options, see:
	// 	// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

	// 	// Upload a larger set of source maps for prettier stack traces (increases build time)
	// 	widenClientFileUpload: true,

	// 	// Transpiles SDK to be compatible with IE11 (increases bundle size)
	// 	transpileClientSDK: true,

	// 	// Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
	// 	tunnelRoute: "/monitoring",

	// 	// Hides source maps from generated client bundles
	// 	hideSourceMaps: true,

	// 	// Automatically tree-shake Sentry logger statements to reduce bundle size
	// 	disableLogger: true,

	// 	// Enables automatic instrumentation of Vercel Cron Monitors.
	// 	// See the following for more information:
	// 	// https://docs.sentry.io/product/crons/
	// 	// https://vercel.com/docs/cron-jobs
	// 	automaticVercelMonitors: true,
	// },
);
