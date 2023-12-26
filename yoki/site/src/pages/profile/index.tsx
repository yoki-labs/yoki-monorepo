import { Typography } from "@mui/joy";
import { GetServerSideProps, GetServerSidePropsResult } from "next";
import { getServerSession } from "next-auth";
import React from "react";

import LayoutWrapper from "../../components/dashboard/layout/LayoutWrapper";
import { GuildedClientServer } from "../../lib/@types/guilded";
// import WelcomeBanner from "../../partials/WelcomeBanner";
import { authOptions } from "../api/auth/[...nextauth]";
import { LabsSessionUser } from "../../utils/routes/pages";
import LandingPage from "../../components/landing/LandingPage";

export const getServerSideProps: GetServerSideProps = async (ctx): Promise<GetServerSidePropsResult<{}>> => {
    const session = await getServerSession(ctx.req, ctx.res, authOptions);
    if (!session?.user.access_token) return { redirect: { destination: "/auth/signin", permanent: false } };

    return { redirect: { destination: "/profile/overview", permanent: false } };
};

export default function Dashboard(props: {}) {
    // router.push("./overview")

    return (
        <LandingPage {...props}>
            <Typography level="title-sm">Redirecting.</Typography>
        </LandingPage>
    );
}
