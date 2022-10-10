import { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { GuildedServer } from "../../lib/@types/guilded/Server";
import { methods } from "../../lib/Fetcher";

// import Sidebar from "../../partials/Sidebar";
// import Header from "../../partials/Header";
import WelcomeBanner from "../../partials/dashboard/WelcomeBanner";
import { authOptions } from "../api/auth/[...nextauth]";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const session = await unstable_getServerSession(ctx.req, ctx.res, authOptions);
    if (!session?.user.access_token) return { props: {} };

    const servers = await methods(session.user.access_token).get("https://authlink.guildedapi.com/api/v1/users/@me/servers");
    return { props: { servers } };
};

const Dashboard: NextPage<{ servers: GuildedServer[] }> = ({ servers }) => {
    // const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            {/* <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /> */}

            {/* Content area */}
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-custom-gray">
                {/*  Site header */}
                {/* <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /> */}

                <main>
                    <div className="px-4 sm:px-6 lg:px-8 py-12 w-full max-w-9xl mx-auto">
                        {/* Welcome banner */}
                        <WelcomeBanner />

                        {/* Dashboard actions */}
                        <div className="mx-auto w-full md:max-w-[100rem] py-5 px-8 md:px-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3 md:auto-cols-min auto-rows-min ">
                            {servers.map((server) => (
                                <div key={server.id}>
                                    <h3 className="text-white text-2xl">{server.name.length > 10 ? server.name.slice(0, 10) + "..." : server.name}</h3>
                                    <Image
                                        className="rounded-full"
                                        src={server.profilePicture ?? `https://img.guildedcdn.com/asset/TeamPage/Avatars/Small/default-team-avatar-${server.name.at(0)}@2x.png`}
                                        width={75}
                                        height={75}
                                        alt={server.name}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};
export default Dashboard;
