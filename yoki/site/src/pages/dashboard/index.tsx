import { GetServerSideProps, GetServerSidePropsResult, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { GuildedServer } from "../../lib/@types/guilded/Server";
import { methods } from "../../lib/Fetcher";

// import Sidebar from "../../partials/Sidebar";
// import Header from "../../partials/Header";
import WelcomeBanner from "../../partials/dashboard/WelcomeBanner";
import { authOptions } from "../api/auth/[...nextauth]";

export const getServerSideProps: GetServerSideProps = async (ctx): Promise<GetServerSidePropsResult<{ servers: GuildedServer[] }>> => {
    const session = await unstable_getServerSession(ctx.req, ctx.res, authOptions);
    if (!session?.user.access_token) return { redirect: { destination: "/auth/signin", permanent: false } };

    const servers = await methods(session.user.access_token).get("https://authlink.guildedapi.com/api/v1/users/@me/servers");
    if (servers.status === 403) return { redirect: { destination: "/auth/signin", permanent: false } };
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
                        <div className="mx-auto w-full md:max-w-[100rem] py-5 px-8 md:px-16 grid gap-4 grid-cols-3 lg:grid-cols-8 md:auto-cols-min auto-rows-min ">
                            {servers.map((server) => (
                                <Link href={`/dashboard/servers/${server.id}`} key={server.id}>
                                    <div className="max-w-[8rem] p-4 hover:bg-black grid place-items-center rounded hover:scale-125 hover:cursor-pointer transition">
                                        <Image
                                            className="rounded-full pb-4"
                                            src={server.profilePicture ?? `https://img.guildedcdn.com/asset/TeamPage/Avatars/Small/default-team-avatar-${server.name.at(0)}@2x.png`}
                                            width={75}
                                            height={75}
                                            alt={server.name}
                                        />
                                        <h3 className={`text-white align-middle max-w-[7rem] break-words text-lg`}>
                                            {server.name.length > 17 ? server.name.slice(0, 17) + "..." : server.name}
                                        </h3>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};
export default Dashboard;
