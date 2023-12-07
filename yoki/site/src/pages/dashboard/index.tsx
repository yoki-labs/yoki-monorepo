import { GetServerSideProps, GetServerSidePropsResult } from "next";
import { getServerSession } from "next-auth";
import React from "react";

import { GuildedClientServer } from "../../lib/@types/guilded";
import { methods } from "../../lib/Fetcher";
// import WelcomeBanner from "../../partials/WelcomeBanner";
import { authOptions } from "../api/auth/[...nextauth]";
import LayoutWrapper from "../../components/dashboard/layout/LayoutWrapper";
import ServerSelectionPage from "../../components/dashboard/pages/ServerSelectionPage";
import { useRouter } from "next/router";
import { LabsSessionUser } from "../../utils/pageUtil";

type SessionProps = {
    servers: GuildedClientServer[];
    user: LabsSessionUser;
};

export const getServerSideProps: GetServerSideProps = async (ctx): Promise<GetServerSidePropsResult<SessionProps>> => {
    const session = await getServerSession(ctx.req, ctx.res, authOptions);
    console.log(`Session user does not have access token:`, !session?.user.access_token);
    if (!session?.user.access_token || !session?.user.id) return { redirect: { destination: "/auth/signin", permanent: false } };

    const servers = await methods(session.user.access_token).get<GuildedClientServer[]>("https://authlink.app/api/v1/users/@me/servers");

    if (!servers) return { redirect: { destination: "/auth/signin", permanent: false } };

    const user = { id: session.user.id, name: session.user.name, avatar: session.user.avatar };

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
