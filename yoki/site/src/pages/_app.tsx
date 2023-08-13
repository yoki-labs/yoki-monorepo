import "../styles/globals.css";
import "../styles/styles.css";

import { CssVarsProvider } from "@mui/joy";
import { Inter } from "@next/font/google";
import { Analytics } from "@vercel/analytics/react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { NextPage } from "next/types";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ReactElement, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";

import { theme } from "../styles/theme";

const ogDescription = "Meet Yoki, your moderation companion. Guilded's first moderation bot.";
const ogUrl = "https://yoki.gg/";
const ogFace = "https://yoki.gg/face.png";
const ogTitle = "Yoki";

// eslint-disable-next-line @typescript-eslint/ban-types
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
    getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps<{ session: Session }> & {
    Component: NextPageWithLayout;
};

const queryClient = new QueryClient();

const inter = Inter({ subsets: ["latin"] });

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppPropsWithLayout) {
    const layout = Component.getLayout ?? ((page) => page);
    // const gql = useContext(gqlClientContext);

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
                <style>html, body, #__next {`{ width: 100%; height: 100%; }`}</style>
            </Head>
            <SessionProvider session={session}>
                <QueryClientProvider client={queryClient}>
                    {/* <gqlClientContext.Provider value={gql}> */}
                    <CssVarsProvider defaultMode="dark" theme={theme}>
                        <main className={inter.className}>
                            <Component {...pageProps} />
                        </main>
                    </CssVarsProvider>
                    {/* </gqlClientContext.Provider> */}
                </QueryClientProvider>
            </SessionProvider>
            <Analytics />
        </>
    );
}

export default MyApp;
