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
                <meta name="description" content="Guilded's first moderation bot." />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Navbar />
            <Component {...pageProps} />
        </>
    );
}

export default MyApp;
