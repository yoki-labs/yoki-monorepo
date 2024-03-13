import { GetServerSideProps, GetServerSidePropsResult } from "next";
import { getServerSession } from "next-auth";
import React from "react";

import DashForm from "../../../components/dashboard/DashForm";
import { GuildedClientServer, GuildedServer } from "../../../lib/@types/guilded";
import { methods } from "../../../lib/Fetcher";
import { authOptions } from "../../api/auth/[...nextauth]";
import prisma, { sanitizeServer } from "../../../prisma";
import NoServerPage from "../../../components/dashboard/pages/NoServerPage";
import LayoutWrapper from "../../../components/dashboard/layout/LayoutWrapper";
import { SanitizedServer } from "../../../lib/@types/db";
import Layout from "../../../components/dashboard/layout/Layout";
import rest from "../../../guilded";
import NotPermittedPage from "../../../components/dashboard/pages/NotPermittedPage";
import { useRouter } from "next/router";
import { LabsSessionUser } from "../../../utils/routes/pages";
import { roleTypeLevels } from "../../../utils/routes/permissions";
import { RoleType } from "@prisma/client";
import { dashboardPageList } from "../../../components/dashboard/pages";

type BaseSessionProps = {
    user: LabsSessionUser;
    servers: GuildedClientServer[];
    currentServer: GuildedServer;
};
type SessionProps =
    | (BaseSessionProps & {
          code: null;
          serverConfig: SanitizedServer;
          page: string[];
          highestRoleType: RoleType;
      })
    | (BaseSessionProps & {
          code: "NOT_FOUND" | "UNPERMITTED";
      });

export const getServerSideProps: GetServerSideProps = async (ctx): Promise<GetServerSidePropsResult<SessionProps>> => {
    const session = await getServerSession(ctx.req, ctx.res, authOptions);
    if (!session?.user.access_token || !session?.user.id) return { redirect: { destination: "/auth/signin", permanent: false } };

    console.log("Session user", session.user);

    const servers = await methods(session.user.access_token).get<GuildedClientServer[]>("https://authlink.guildedapi.com/api/v1/users/@me/servers");
    if (!servers) return { redirect: { destination: "/auth/signin", permanent: false } };

    // /dashboard/:serverId/:page
    const { serverId, page } = ctx.query;

    const referencedServer = (await rest.router.servers.serverRead({ serverId: serverId as string }).catch(() => null))?.server;

    // Not in that server; cannot manage it
    if (!referencedServer) return { redirect: { destination: "/dashboard", permanent: false } };

    const serverInDb = (
        await prisma.server.findMany({
            where: {
                serverId: referencedServer.id,
            },
        })
    )[0];

    const user = { id: session.user.id, name: session.user.name, avatar: session.user.avatar };

    // No server found
    if (!serverInDb) return { props: { code: "NOT_FOUND", servers, user, currentServer: referencedServer } };

    // If they don't have a proper role to manage the server, then don't allow using dashboard functions
    const member = await rest.router.members
        .serverMemberRead({ serverId: serverInDb.serverId, userId: session.user.id! })
        .then((x) => x.member)
        .catch(() => null);

    // Pretend server doesn't exist by also giving 404 instead of 403
    // Not much use for privacy, but just giving less info I guess
    if (!member) return { props: { code: "NOT_FOUND", servers, user, currentServer: referencedServer } };

    const roleLevels = await prisma.role.findMany({
        where: {
            serverId: serverInDb.serverId,
            // type: RoleType.ADMIN,
        },
    });

    const adminRoles = roleLevels.map((role) => role.roleId);

    if (!(member?.isOwner || member?.roleIds.find((x) => adminRoles.includes(x)))) return { props: { code: "UNPERMITTED", servers, user, currentServer: referencedServer! } };

    // We likely do not need a check for whether it's an owner, but I'll keep it here
    const highestLevel = roleLevels.length
        ? roleLevels.reduce((a, b) => (roleTypeLevels[a.type] > roleTypeLevels[b.type] ? a : b)).type
        : member?.isOwner
        ? RoleType.ADMIN
        : RoleType.MINIMOD;

    return {
        props: {
            code: null,
            servers,
            user,
            currentServer: referencedServer!,
            serverConfig: sanitizeServer(serverInDb),
            page: page as string[],
            highestRoleType: highestLevel,
        },
    };
};

export default function Dashboard(props: SessionProps) {
    const router = useRouter();

    const onServerChange = (serverId: string) => {
        router.push(`/dashboard/${serverId}/overview`);
    };

    // All good
    if (!props.code) {
        const [mainPage, subPage] = props.page;
        const currentPage = dashboardPageList.find((x) => x.id === mainPage);

        return (
            <Layout {...props} currentPage={currentPage} onServerChange={onServerChange}>
                <DashForm currentServer={props.currentServer} serverConfig={props.serverConfig} page={currentPage} highestRoleType={props.highestRoleType} />
            </Layout>
        );
    }
    // No ADMIN code
    else if (props.code === "UNPERMITTED")
        return (
            <LayoutWrapper {...props} onServerChange={onServerChange}>
                <NotPermittedPage currentServer={props.currentServer} />
            </LayoutWrapper>
        );

    // No server
    return (
        <LayoutWrapper {...props} onServerChange={onServerChange}>
            <NoServerPage currentServer={props.currentServer} />
        </LayoutWrapper>
    );
}
