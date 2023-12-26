import type { GetServerSideProps, NextPage } from "next";

import LandingPage from "../../components/landing/LandingPage";
import { LabsSessionUser } from "../../utils/routes/pages";
import prisma from "../../prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import { ProfileSidebar } from "../../components/profile/ProfileSidebar";
import ProfileForm from "../../components/profile/ProfileForm";
import { Box } from "@mui/joy";

interface ProfilePageSessionProps {
    user: LabsSessionUser;
    totalAppealCount: number;
    awaitingAppealCount: number;
    page: string;
}

export const getServerSideProps: GetServerSideProps<ProfilePageSessionProps> = async (ctx) => {
    const { page } = ctx.query;

    const session = await getServerSession(ctx.req, ctx.res, authOptions);
    if (!session?.user.access_token || !session?.user.id) return { redirect: { destination: "/auth/signin", permanent: false } };

    console.log("Session user", session.user);

    const user = { id: session.user.id!, name: session.user.name, avatar: session.user.avatar };

    const totalAppealCount = await prisma.appeal.count({
        where: {
            creatorId: session.user.id!,
        },
    });

    const awaitingAppealCount = await prisma.appeal.count({
        where: {
            status: null,
            creatorId: session.user.id!,
        },
    });

    return { props: { user, totalAppealCount, awaitingAppealCount, page: page as string } };
};

const Profile: NextPage<ProfilePageSessionProps> = ({ page, user, totalAppealCount, awaitingAppealCount }) => {
    return (
        <LandingPage user={user}>
            <div className="flex w-full px-0 py-12 flex-col md:flex-row md:px-36">
                <ProfileSidebar page={page} menuToggled={false} />
                <Box className="grow flex w-full">
                    <ProfileForm page={page} user={user} totalAppealCount={totalAppealCount} awaitingAppealCount={awaitingAppealCount} />
                </Box>
            </div>
        </LandingPage>
    );
};

export default Profile;
