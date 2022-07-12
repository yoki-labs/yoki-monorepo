import "../styles/globals.css";
import "../styles/styles.css";

import type { AppProps } from "next/app";
import Head from "next/head";

import Navbar from "../components/navbar/navbar";

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <title>Yoki</title>

                <title>Yoki</title>
                <meta name="description" content="Guilded's first moderation bot. Complete with automoderation, nsfw image filtering, and modmail." />

                <meta property="og:url" content="https://yoki.gg/" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Yoki" />
                <meta property="og:description" content="Guilded's first moderation bot. Complete with automoderation, nsfw image filtering, and modmail." />
                <meta property="og:image" content="https://yoki.gg/face.png" />

                <meta name="twitter:card" content="summary_large_image" />
                <meta property="twitter:domain" content="yoki.gg" />
                <meta property="twitter:url" content="https://yoki.gg/" />
                <meta name="twitter:title" content="Yoki" />
                <meta name="twitter:description" content="Guilded's first moderation bot. Complete with automoderation, nsfw image filtering, and modmail." />
                <meta name="twitter:image" content="https://yoki.gg/face.png" />

                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Navbar />
            <Component {...pageProps} />
        </>
    );
}

export default MyApp;
