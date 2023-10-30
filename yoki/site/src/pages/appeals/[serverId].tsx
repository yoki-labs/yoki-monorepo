import { isHashId } from "@yokilabs/utils";
import { GetServerSideProps, NextPage } from "next";
import { getServerSession } from "next-auth";
import React from "react";

import AppealsPageDisplay from "../../components/appeals/AppealsPageDisplay";
import LandingPage from "../../components/landing/LandingPage";
import rest from "../../guilded";
import prisma from "../../prisma";
import { AppealsSessionProps, appealWaitingTime } from "../../utils/appealUtil";
// import WelcomeBanner from "../../partials/WelcomeBanner";
import { authOptions } from "../api/auth/[...nextauth]";

export const getServerSideProps: GetServerSideProps<AppealsSessionProps> = async (ctx) => {
    const session = await getServerSession(ctx.req, ctx.res, authOptions);
    if (!session?.user.access_token) return { redirect: { destination: "/auth/signin", permanent: false } };

    console.log("Session user", session.user);

    // /appeals/:serverId
    const { serverId } = ctx.query;

    // The ID is invalid
    if (!(typeof serverId === "string" && isHashId(serverId))) return { redirect: { destination: `/`, permanent: false } };

    // Get the server they are appealing for
    const serverInDb = (
        await prisma.server.findMany({
            where: {
                serverId,
            },
        })
    )[0];

    const user = { id: session.user.id, name: session.user.name, avatar: session.user.avatar };

    // No server found
    if (!serverInDb) return { props: { code: "NOT_FOUND", user } };
    // No ability to appeal
    else if (!(serverInDb.appealsEnabled && serverInDb.appealChannelId)) return { props: { code: "UNAVAILABLE", user } };

    const guildedServer = await rest.router.servers
        .serverRead({ serverId })
        .then((x) => x.server)
        .catch(() => null);

    // Used to be in that server, but only config exist
    if (!guildedServer) return { props: { code: "NOT_FOUND", user } };

    const ban = await rest.router.memberBans
        .serverMemberBanRead({ serverId, userId: session.user.id! })
        .then((x) => x.serverMemberBan)
        .catch(() => null);

    // Can't appeal it if you aren't banned
    if (!ban) return { props: { code: "NOT_BANNED", user } };

    const previousAppeals = await prisma.appeal.findMany({
        orderBy: [{ createdAt: "desc" }],
        where: {
            serverId,
            creatorId: session.user.id!,
        },
    });

    const elapsedTime = Date.now() - (previousAppeals[0]?.createdAt.getTime() ?? 0);

    // 5 days haven't been waited through
    if (elapsedTime < appealWaitingTime) return { props: { code: "TOO_FAST", user, elapsedTime } };

    return { props: { code: null, user, server: guildedServer } };
};

const AppealPage: NextPage<AppealsSessionProps> = (props) => {
    return (
        <LandingPage user={props.user}>
            <AppealsPageDisplay {...props} />
        </LandingPage>
    );
};

export default AppealPage;
