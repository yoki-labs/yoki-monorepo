import "../styles/globals.css";
import "../styles/styles.css";

import type { AppProps } from "next/app";
import Head from "next/head";
import stripIndent from "strip-indent";

import Footer from "../components/footer/Footer";
import Navbar from "../components/navbar/navbar";
const ogDescription = stripIndent(`The first moderation bot on Guilded.
🛑 Moderation + automod
🙈 Content filtering + image scanning
📇 Server + moderation logs
📨 Modmail + support
`);
const ogUrl = "https://yoki.gg/";
const ogFace = "https://yoki.gg/face.png";
const ogTitle = "Yoki";

function MyApp({ Component, pageProps }: AppProps) {
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
            <Navbar />
            <Component {...pageProps} />
            <div className="px-20">
                <Footer />
            </div>
        </>
    );
}

export default MyApp;
