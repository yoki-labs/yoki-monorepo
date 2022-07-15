import type { NextPage } from "next";

import CTAButton from "../components/buttons/CTAButton";
import FeatureListItem from "../components/FeatureListItem";
import YokiPreview from "../components/previews/YokiPreview";

const Home: NextPage = () => {
    return (
        <div className="px-16 py-20 grid grid-cols-10">
            <div className="text-center col-span-10 md:col-span-6">
                <h1 className="text-4xl text-white font-bold">
                    Meet <span className="text-custom-guilded">Yoki</span>, your <br />
                    moderation companion
                </h1>
                <div className="pt-6">
                    <p className="text-md text-white text-slate-300">
                        Yoki has a powerful set of moderation tools to <br />
                        make your communities safer
                    </p>
                </div>
                <div className="pt-6 text-white text-center">
                    <div className="inline-block space-y-2 text-left">
                        <FeatureListItem text="Moderation + automod" />
                        <FeatureListItem text="Content filtering + image scanning" />
                        <FeatureListItem text="Server + moderation logs" />
                        <FeatureListItem text="Modmail + support" />
                    </div>
                </div>
                <div className="pt-8 space-x-4 space-y-2">
                    <CTAButton bgColor="gradient" text="Invite now" link="/invite" />
                    <CTAButton text="Get support" link="support" />
                </div>
                <p className="px-8 pt-8 text-white text-gray-50 text-sm">
                    Made by{" "}
                    <a className="underline underline-offset-4" href="https://github.com/yoki-labs">
                        Yoki Labs
                    </a>
                </p>
            </div>
            <div className="col-span-3 hidden lg:block">
                <YokiPreview />
            </div>
        </div>
    );
};

export default Home;
