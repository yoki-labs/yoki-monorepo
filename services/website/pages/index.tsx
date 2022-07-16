import type { NextPage } from "next";
import Link from "next/link";

import CTAButton from "../components/buttons/CTAButton";
import FeatureListItem from "../components/FeatureListItem";
import FeaturePreview from "../components/previews/FeaturePreview";
import YokiPreview from "../components/previews/YokiPreview";

const Home: NextPage = () => {
    return (
        <>
            <div className="px-16 pb-20">
                <div className="py-20 grid grid-cols-10">
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
                        <div className="pt-6 text-white text-center pl-6 md:pl-0">
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
                <hr className="text-grey-600 opacity-50" />
                <div>
                    {[
                        {
                            header: "Moderation without the mods.",
                            description:
                                "Our robust content filter comes with presets comprised of over a hundred popular slurs, swears, and other unfavorable words to blacklist from your server.",
                            src: "/features/wordFilter.png",
                        },
                        {
                            header: "Bring your staff and members closer.",
                            description:
                                "Our modmail system provides your server a means for members to report issues directly to staff while providing transparency to the rest of your team.",
                            src: "/features/modmail.png",
                        },
                        {
                            header: "Block inappropriate images before they get seen.",
                            description: "Our NSFW image filters catch inappropriate content automatically and apply punishments right away.",
                            src: "/features/nsfwFilter.png",
                        },
                    ].map((x, i) => (
                        <FeaturePreview key={x.src} {...x} position={i % 2 === 0 ? "right" : "left"} />
                    ))}
                </div>
            </div>
            <div className="w-full py-8 md:py-16 px-8 text-center bg-custom-guilded">
                <div className="m-auto">
                    <h1 className="text-black text-6xl font-bold">Get started now</h1>
                    <div className="py-6">
                        <Link href="/invite">
                            <button className="px-4 py-1 rounded text-lg border-2 bg-custom-gray transition hover:scale-110">
                                <p className="font-semibold text-white">Invite the bot</p>
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Home;
