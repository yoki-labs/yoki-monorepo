import { GetServerSideProps, GetServerSidePropsResult } from "next";
import { getServerSession } from "next-auth";
import React from "react";

import { GuildedServer } from "../../lib/@types/guilded";
import { methods } from "../../lib/Fetcher";
// import WelcomeBanner from "../../partials/WelcomeBanner";
import { authOptions } from "../api/auth/[...nextauth]";
import LayoutWrapper from "../../components/dashboard/layout/LayoutWrapper";
import ServerSelectionPage from "../../components/dashboard/pages/ServerSelectionPage";
import { useRouter } from "next/router";

type SessionProps = {
    servers: GuildedServer[];
    user: Partial<{
        name: string | null;
        avatar: string | null;
    }>;
};

export const getServerSideProps: GetServerSideProps = async (ctx): Promise<GetServerSidePropsResult<SessionProps>> => {
    const session = await getServerSession(ctx.req, ctx.res, authOptions);
    console.log(`Session user does not have access token:`, !session?.user.access_token);
    if (!session?.user.access_token) return { redirect: { destination: "/auth/signin", permanent: false } };

    console.log("Session user", session.user);

    const servers = await methods(session.user.access_token).get<GuildedServer[]>("https://authlink.app/api/v1/users/@me/servers");
    console.log("Server list", { servers });
    if (!servers?.length) return { redirect: { destination: "/auth/signin", permanent: false } };

    const user = { name: session.user.name, avatar: session.user.avatar };

    return { props: { servers, user } };
};

export default function Dashboard(props: SessionProps) {
    const router = useRouter();

    const onServerChange = (serverId: string) => {
        router.push(`/dashboard/${serverId}/overview`);
    };

    return (
        <LayoutWrapper {...props} onServerChange={onServerChange}>
            <ServerSelectionPage servers={props.servers} />
        </LayoutWrapper>
    );
}
