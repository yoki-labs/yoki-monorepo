import { Typography } from "@mui/joy";
import { GetServerSideProps, GetServerSidePropsResult } from "next";
import { getServerSession } from "next-auth";
import React from "react";

import LayoutWrapper from "../../../components/dashboard/layout/LayoutWrapper";
import { GuildedClientServer } from "../../../lib/@types/guilded";
import { methods } from "../../../lib/Fetcher";
// import WelcomeBanner from "../../partials/WelcomeBanner";
import { authOptions } from "../../api/auth/[...nextauth]";
import rest from "../../../guilded";
import { LabsSessionUser } from "../../../utils/routes/pages";

interface SessionProps {
    servers: GuildedClientServer[];
    user: LabsSessionUser;
}

export const getServerSideProps: GetServerSideProps = async (ctx): Promise<GetServerSidePropsResult<SessionProps>> => {
    const session = await getServerSession(ctx.req, ctx.res, authOptions);
    if (!session?.user.access_token) return { redirect: { destination: "/auth/signin", permanent: false } };

    console.log("Session user", session.user);

    const servers = await methods(session.user.access_token).get<GuildedClientServer[]>("https://authlink.app/api/v1/users/@me/servers");
    if (!servers) return { redirect: { destination: "/auth/signin", permanent: false } };

    // /dashboard/:serverId
    const { serverId } = ctx.query;

    if (!serverId) return { redirect: { destination: "/dashboard", permanent: false } };

    // If this user isn't in that server, redirect them back to dashboard server selection
    const referencedServer = await rest.router.servers.serverRead({ serverId: serverId as string }).catch(() => null);
    const destination = referencedServer ? `/dashboard/${serverId}/overview` : "/dashboard";

    return { redirect: { destination, permanent: false } };
};

export default function Dashboard(props: SessionProps) {
    // router.push("./overview")

    return (
        <LayoutWrapper onServerChange={() => null} {...props}>
            <Typography level="title-sm">Redirecting.</Typography>
        </LayoutWrapper>
    );
}
