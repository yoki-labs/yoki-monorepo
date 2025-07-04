import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";

import { authOptions } from "../../old_pages/api/auth/[...nextauth]";

export type LabsSessionUser = { id: string } & Partial<{
    name: string | null;
    avatar: string | null;
}>;
export interface LabsProfiledUser {
    id: string;
    name: string;
    subdomain: string | undefined | null;
    avatar: string | undefined | null;
    banner: string | undefined | null;
    aboutInfo: Partial<{ tagLine: string | null; bio: string | null }> | undefined | null;
}

export interface LandingPageSessionProps {
    user: LabsSessionUser | null;
}

export const getLandingPagePageProps: GetServerSideProps<LandingPageSessionProps> = async (ctx) => {
    const session = await getServerSession(ctx.req, ctx.res, authOptions);

    const user = (session?.user.id && { id: session.user.id!, name: session.user.name, avatar: session.user.avatar }) || null;

    return { props: { user } };
};
