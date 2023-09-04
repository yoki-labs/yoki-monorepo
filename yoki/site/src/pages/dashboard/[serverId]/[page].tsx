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
import rest from "../../../guilded";
import { RoleType } from "@prisma/client";
import NotPermittedPage from "../../../components/dashboard/pages/NotPermittedPage";

// type SessionProps = {
    //     serverConfig: SanitizedServer | null;
    //     user: Partial<{
//         name: string | null;
//         avatar: string | null;
//     }>
//     page: string;
// };
type BaseSessionProps = {
    user: Partial<{
        name: string | null;
        avatar: string | null;
    }>;
    servers: GuildedServer[];
    currentServer: GuildedServer;
};
type SessionProps =
    (BaseSessionProps & {
        code: 0,
        serverConfig: SanitizedServer;
        page: string;
    }) |
    (BaseSessionProps & {
        code: 1 | 2,
    })
;

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

    // No server found
    if (!serverInDb)
        return { props: { code: 1, servers, user, currentServer: referencedServer, } };

    // If they don't have a proper role to manage the server, then don't allow using dashboard functions
    const member = await rest.router.members
        .serverMemberRead({ serverId: serverInDb.serverId, userId: session.user.id! })
        .then((x) => x.member)
        .catch(() => null);
    
    // Pretend server doesn't exist by also giving 404 instead of 403
    // Not much use for privacy, but just giving less info I guess
    if (!member)
        return { props: { code: 1, servers, user, currentServer: referencedServer, } };
    
    const adminRoles = await prisma.role
        .findMany({
            where: {
                serverId: serverInDb.serverId,
                type: RoleType.ADMIN,
            }
        })
        .then((roles) =>
            roles.map((role) => role.roleId)
        );

    if (!(member?.isOwner || member?.roleIds.find((x) => adminRoles.includes(x))))
        return { props: { code: 2, servers, user, currentServer: referencedServer, } };

    return {
        props: {
            code: 0,
            servers,
            user,
            currentServer: referencedServer,
            serverConfig: sanitizeServer(serverInDb),
            page: page as string,
        }
    };
};

export default function Dashboard(props: SessionProps) {
    // All good
    if (!props.code)
        return (
            <Layout {...props}>
                <DashForm serverConfig={props.serverConfig} page={props.page} />
            </Layout>
        );
    // No ADMIN code
    else if (props.code === 2)
        return (
            <LayoutWrapper {...props}>
                <NotPermittedPage currentServer={props.currentServer} />
            </LayoutWrapper>
        );

    // No server
    return (
        <LayoutWrapper {...props}>
            <NoServerPage currentServer={props.currentServer} />
        </LayoutWrapper>
    );
}
