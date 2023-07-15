import { GetServerSideProps, GetServerSidePropsResult } from "next";
import { getServerSession } from "next-auth";
import React from "react";

import DashForm from "../../../components/dashboard/DashForm";
import { GuildedServer } from "../../../lib/@types/guilded";
import { methods } from "../../../lib/Fetcher";
// import WelcomeBanner from "../../partials/WelcomeBanner";
import { authOptions } from "../../api/auth/[...nextauth]";
import prisma, { sanitizeServer } from "../../../prisma";
import NoServerPage from "../../../components/dashboard/pages/NoServerPage";
import LayoutWrapper from "../../../components/dashboard/layout/LayoutWrapper";
import { SanitizedServer } from "../../../lib/@types/db";
import Layout from "../../../components/dashboard/layout/Layout";

type SessionProps = {
    servers: GuildedServer[];
    currentServer: GuildedServer;
    serverConfig: SanitizedServer | null;
    user: Partial<{
        name: string | null;
        avatar: string | null;
    }>
    page: string;
};

export const getServerSideProps: GetServerSideProps = async (ctx): Promise<GetServerSidePropsResult<SessionProps>> => {
    const session = await getServerSession(ctx.req, ctx.res, authOptions);
    if (!session?.user.access_token) return { redirect: { destination: "/auth/signin", permanent: false } };

    console.log("Session user", session.user);

    const servers = await methods(session.user.access_token).get<GuildedServer[]>("https://authlink.guildedapi.com/api/v1/users/@me/servers");
    if (!servers?.length) return { redirect: { destination: "/auth/signin", permanent: false } };

    // /dashboard/:serverId/:page
    const { serverId, page } = ctx.query;

    const referencedServer = servers.find((x) => x.id === serverId);

    // Not in that server; cannot manage it
    if (!referencedServer)
        return { redirect: { destination: `/dashboard`, permanent: false } };

    const serverInDb = (await prisma.server.findMany({
        where: {
            serverId: referencedServer.id,
        }
    }))[0];

    const user = { name: session.user.name, avatar: session.user.avatar };

    console.log("Server in DB", serverInDb);

    return {
        props: {
            servers,
            user,
            currentServer: referencedServer,
            serverConfig: serverInDb ? sanitizeServer(serverInDb) : null,
            page: page as string,
        }
    };
};

export default function Dashboard(props: SessionProps) {
    return (
        props.serverConfig
        ? <Layout {...props}>
            <DashForm serverConfig={props.serverConfig} page={props.page} />
        </Layout>
        : <LayoutWrapper {...props}>
            <NoServerPage currentServer={props.currentServer} />
        </LayoutWrapper>
    );
}
