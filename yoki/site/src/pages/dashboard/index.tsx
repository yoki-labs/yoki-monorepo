import { GetServerSideProps, GetServerSidePropsResult } from "next";
import { getServerSession } from "next-auth";
import React from "react";

import DashForm from "../../components/dashboard/DashForm";
import Layout from "../../components/dashboard/layout/Layout";
import { GuildedServer } from "../../lib/@types/guilded/Server";
import { methods } from "../../lib/Fetcher";
// import WelcomeBanner from "../../partials/WelcomeBanner";
import { authOptions } from "../api/auth/[...nextauth]";

type SessionProps = {
    servers: GuildedServer[];
    user: Partial<{
        name: string | null;
        avatar: string | null;
    }>
};

export const getServerSideProps: GetServerSideProps = async (ctx): Promise<GetServerSidePropsResult<SessionProps>> => {
    const session = await getServerSession(ctx.req, ctx.res, authOptions);
    if (!session?.user.access_token) return { redirect: { destination: "/auth/signin", permanent: false } };

    console.log("Session user", session.user);

    const servers = await methods(session.user.access_token).get<GuildedServer[]>("https://authlink.guildedapi.com/api/v1/users/@me/servers");
    if (!servers?.length) return { redirect: { destination: "/auth/signin", permanent: false } };

    const user = { name: session.user.name, avatar: session.user.avatar };

    return { props: { servers, user } };
};

export default function Dashboard(props: SessionProps) {
    return (
        <Layout {...props}>
            {/* <WelcomeBanner /> */}
            <DashForm />
        </Layout>
    );
}
