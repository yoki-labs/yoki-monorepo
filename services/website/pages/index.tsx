import type { NextPage } from "next";
import Head from "next/head";

import Navbar from "../components/navbar/navbar";

const Home: NextPage = () => {
    return (
        <>
            <Head>
                <title>Yoki</title>
                <meta name="description" content="Guilded's first moderation bot." />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Navbar />
        </>
    );
};

export default Home;
