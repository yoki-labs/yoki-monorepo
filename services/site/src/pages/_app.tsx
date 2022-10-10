import "../styles/globals.css";
import "../styles/styles.css";

import type { AppProps } from "next/app";
import Head from "next/head";
import { SessionProvider } from "next-auth/react";

const ogDescription = "Meet Yoki, your moderation companion. Guilded's first moderation bot.";
const ogUrl = "https://yoki.gg/";
const ogFace = "https://yoki.gg/face.png";
const ogTitle = "Yoki";

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
    return (
        <>
            <Head>
                <title>{ogTitle}</title>
                <meta name="description" content={ogDescription} />

                <meta property="og:url" content={ogUrl} />
                <meta property="og:type" content="website" />
                <meta property="og:title" content={ogTitle} />
                <meta property="og:description" content={ogDescription} />
                <meta property="og:image" content={ogFace} />

                <meta name="twitter:card" content="summary_large_image" />
                <meta property="twitter:domain" content="yoki.gg" />
                <meta property="twitter:url" content={ogUrl} />
                <meta name="twitter:title" content={ogTitle} />
                <meta name="twitter:description" content={ogDescription} />
                <meta name="twitter:image" content={ogFace} />

                <link rel="icon" href="/favicon.ico" />
            </Head>
            <SessionProvider session={session}>
                <Component {...pageProps} />
            </SessionProvider>
        </>
    );
}

export default MyApp;
