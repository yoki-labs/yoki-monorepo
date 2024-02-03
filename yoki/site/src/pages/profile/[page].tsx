import type { GetServerSideProps, NextPage } from "next";

import LandingPage from "../../components/landing/LandingPage";
import { LabsProfiledUser } from "../../utils/routes/pages";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import { ProfileSidebar } from "../../components/profile/ProfileSidebar";
import ProfileForm from "../../components/profile/ProfileForm";
import { Box } from "@mui/joy";
import { methods } from "../../lib/Fetcher";
import { GuildedProfile } from "next-auth-guilded/dist/types/typings";

interface ProfilePageSessionProps {
    user: LabsProfiledUser;
    page: string;
}

export const getServerSideProps: GetServerSideProps<ProfilePageSessionProps> = async (ctx) => {
    const { page } = ctx.query;

    const session = await getServerSession(ctx.req, ctx.res, authOptions);
    if (!session?.user.access_token || !session?.user.id) return { redirect: { destination: "/auth/signin", permanent: false } };

    const profile = await methods(session.user.access_token).get<GuildedProfile>("https://authlink.app/api/v1/users/@me");

    const user: LabsProfiledUser = {
        id: session.user.id!,
        name: session.user.name ?? profile.name,
        subdomain: profile.subdomain,
        avatar: session.user.avatar ?? profile.avatar,
        banner: profile.banner,
        aboutInfo: profile.aboutInfo,
    };

    return { props: { user, page: page as string } };
};

const Profile: NextPage<ProfilePageSessionProps> = ({ page, user }) => {
    return (
        <LandingPage user={user}>
            <div className="flex w-full px-0 py-12 flex-col md:flex-row md:px-36">
                <ProfileSidebar page={page} menuToggled={false} />
                <Box className="grow flex w-full">
                    <ProfileForm page={page} user={user} />
                </Box>
            </div>
        </LandingPage>
    );
};

export default Profile;
