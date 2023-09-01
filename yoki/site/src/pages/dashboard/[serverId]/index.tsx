import { GetServerSideProps, GetServerSidePropsResult } from "next";
import { getServerSession } from "next-auth";
import React from "react";

import DashForm from "../../../components/dashboard/DashForm";
import Layout from "../../../components/dashboard/layout/Layout";
import { GuildedServer } from "../../../lib/@types/guilded";
import { methods } from "../../../lib/Fetcher";
// import WelcomeBanner from "../../partials/WelcomeBanner";
import { authOptions } from "../../api/auth/[...nextauth]";
import { useRouter } from "next/router";
import { redirect } from "next/dist/server/api-utils";
import LayoutWrapper from "../../../components/dashboard/layout/LayoutWrapper";
import { Typography } from "@mui/joy";

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

    const servers = await methods(session.user.access_token).get<GuildedServer[]>("https://authlink.app/api/v1/users/@me/servers");
    if (!servers?.length) return { redirect: { destination: "/auth/signin", permanent: false } };

    // /dashboard/:serverId
    const { serverId } = ctx.query;

    // If this user isn't in that server, redirect them back to dashboard server selection
    const destination = servers.find((x) => x.id === serverId) ? `/dashboard/${serverId}/overview` : `/dashboard`

    return { redirect: { destination, permanent: false } };
};

export default function Dashboard(props: SessionProps) {

    // router.push("./overview")

    return (
        <LayoutWrapper {...props}>
            <Typography level="title-sm">Redirecting.</Typography>
        </LayoutWrapper>
    );
}