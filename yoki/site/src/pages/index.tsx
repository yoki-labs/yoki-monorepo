import type { NextPage } from "next";
import Link from "next/link";

import FeatureListItem from "../components/landing/FeatureListItem";
import { LandingPage } from "../components/landing/LandingPage";
import FeaturePreview from "../components/landing/previews/FeaturePreview";
import YokiPreview from "../components/landing/previews/YokiPreview";
import { HomePreview, HomeTextBlurb, HomeWrapper } from "../styles/components/home";
import { Button } from "../styles/globals";

const Home: NextPage = () => {
    const features = [
        {
            header: "Moderation without the mods.",
            shortHeader: "automod",
            description:
                "Our robust content filter scans text, images, invites, and links to keep the content you want and block the content you don't. Comes with numerous presets for popular slurs, NSFW links, profanity, and more.",
            src: "/features/wordFilter.png",
        },
        {
            header: "Bringing your staff and members closer.",
            shortHeader: "modmail",
            description: "Our modmail system provides your server a way for members to communicate directly with your staff. Comes with full chat logs.",
            src: "/features/modmail.png",
        },
        {
            header: "Stopping raiders right in their tracks.",
            shortHeader: "antiraid",
            description: "Present new or suspicious accounts with captchas or kick them automatically. Choose from a variety of properties to mark an account as suspicious.",
            src: "/features/site_cap_combined.png",
        },
        {
            header: "Giving you a record of everything.",
            shortHeader: "log channels",
            description: "Track message edits/deletions, member joins/leaves, moderator actions, and much more with log channels.",
            src: "/features/logchannels.png",
        },
    ];

    const previews = features.map((x, i) => <FeaturePreview key={x.src} {...x} position={i % 2 === 0 ? "right" : "left"} />);

    return (
        <LandingPage>
            <HomeWrapper>
                <div className="border-slate-200"></div>
                <div className="pb-20">
                    <HomePreview>
                        <div className="flex flex-col justify-center meet-yoki">
                            <h1 className="flex flex-col text-6xl text-white font-bold">
                                <span>
                                    Meet <span className="text-custom-guilded">Yoki</span>
                                </span>
                                <span className="text-xl">Your moderation companion</span>
                            </h1>
                            <div className="py-2 md:py-2 text-white">
                                <div className="inline-block space-y-2 text-left">
                                    <FeatureListItem text="Moderation + automod" />
                                    <FeatureListItem text="Text + link + image scanning" />
                                    <FeatureListItem text="Server + moderation logs" />
                                    <FeatureListItem text="Modmail + support" />
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row gap-2 py-2 md:space-x-4 md:inline-flex">
                                <Button className="filled">
                                    <a href="/invite">Invite Now</a>
                                </Button>
                                <Button>
                                    <a href="/support">Get Support</a>
                                </Button>
                            </div>
                            <p className="text-white text-gray-50 text-sm">
                                Made by{" "}
                                <a className="underline underline-offset-4" href="https://github.com/yoki-labs">
                                    Yoki Labs
                                </a>
                            </p>
                        </div>
                        <div className="my-auto hidden lg:block">
                            <YokiPreview />
                        </div>
                    </HomePreview>
                    <HomeTextBlurb>
                        <h1>Why Yoki?</h1>
                        <p>Yoki delivers a reliable service from moderation to ...</p>
                    </HomeTextBlurb>
                    <hr className="text-grey-600 opacity-50" />
                    <div>{previews}</div>
                </div>
                <div className="w-full rounded-lg py-8 md:py-16 px-8 text-center bg-custom-guilded">
                    <div className="m-auto">
                        <h1 className="text-black text-4xl md:text-6xl font-bold">Get started now</h1>
                        <div className="py-6">
                            <Link href="/invite">
                                <button className="px-6 py-2 md:px-4 md:py-1 rounded text-2xl md:text-lg bg-custom-gray transition hover:scale-110">
                                    <p className="font-semibold text-white">Invite the bot</p>
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </HomeWrapper>
        </LandingPage>
    );
};

export default Home;
