import "../styles/globals.css";
import "../styles/styles.css";

import type { AppProps } from "next/app";
import Head from "next/head";
import { SessionProvider } from "next-auth/react";
import { ReactElement, ReactNode, useContext } from "react";
import { NextPage } from "next/types";
import { gqlClientContext } from "../utils/gqlContext";

const ogDescription = "Meet Yoki, your moderation companion. Guilded's first moderation bot.";
const ogUrl = "https://yoki.gg/";
const ogFace = "https://yoki.gg/face.png";
const ogTitle = "Yoki";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
    getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppPropsWithLayout) {
    const layout = Component.getLayout ?? ((page) => page);
    const gql = useContext(gqlClientContext);

    return layout(
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
                <gqlClientContext.Provider value={gql}>
                    <Component {...pageProps} />
                </gqlClientContext.Provider>
            </SessionProvider>
        </>
    );
}

export default MyApp;
