import type { NextPage } from "next";
import Head from "next/head";

import CTAButton from "../components/buttons/CTAButton";
import FeatureListItem from "../components/FeatureListItem";
import Navbar from "../components/navbar/navbar";
import YokiPreview from "../components/previews/YokiPreview";

const Home: NextPage = () => {
    return (
        <>
            <Head>
                <title>Yoki</title>
                <meta name="description" content="Guilded's first moderation bot." />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Navbar />
            <div className="px-16 py-20 grid grid-cols-10">
                <div className="text-center col-span-10 md:col-span-6">
                    <h1 className="text-4xl text-white font-bold">
                        Meet <span className="text-custom-guilded">Yoki</span>, your <br />
                        moderation companion
                    </h1>
                    <div className="pt-6">
                        <p className="text-md text-slate-300">
                            Yoki has a powerful set of moderation tools to <br />
                            make your communities safer
                        </p>
                    </div>
                    <div className="pt-6 text-white space-y-2">
                        <FeatureListItem text="Moderation & Automoderation features" />
                        <FeatureListItem text="Content filtering & Image scanning" />
                        <FeatureListItem text="Server & Moderation action logging" />
                        <FeatureListItem text="Modmail & Support" />
                    </div>
                    <div className="pt-8 space-x-4 space-y-2">
                        <CTAButton bgColor="gradient" text="Invite now" link="/invite" />
                        <CTAButton text="Get support" link="support" />
                    </div>
                    <p className="px-8 pt-8 text-gray-50 text-sm">
                        Made by{" "}
                        <a className="underline underline-offset-4" href="https://github.com/yoki-labs">
                            Yoki Labs
                        </a>
                    </p>
                </div>
                <div className="col-span-3  hidden md:block">
                    <YokiPreview />
                </div>
            </div>
        </>
    );
};

export default Home;
