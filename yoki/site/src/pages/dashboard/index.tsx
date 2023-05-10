import { GetServerSideProps, GetServerSidePropsResult } from "next";
import { getServerSession } from "next-auth";
import React from "react";

// import WelcomeBanner from "../../partials/WelcomeBanner";
import { authOptions } from "../api/auth/[...nextauth]";
import DashForm from "../../components/dashboard/DashForm";
import Layout from "../../components/dashboard/Layout";
import { GuildedServer } from "../../lib/@types/guilded/Server";
import { methods } from "../../lib/Fetcher";

export const getServerSideProps: GetServerSideProps = async (ctx): Promise<GetServerSidePropsResult<{ servers: GuildedServer[] }>> => {
    const session = await getServerSession(ctx.req, ctx.res, authOptions);
    if (!session?.user.access_token) return { redirect: { destination: "/auth/signin", permanent: false } };

    const servers = await methods(session.user.access_token).get<GuildedServer[]>("https://authlink.guildedapi.com/api/v1/users/@me/servers");
    if (!servers?.length) return { redirect: { destination: "/auth/signin", permanent: false } };
    return { props: { servers } };
};

export default function Dashboard(props: { servers: GuildedServer[] }) {
    return (
        <Layout servers={props.servers}>
            {/* <WelcomeBanner /> */}
            <DashForm />
        </Layout>
    );
}
