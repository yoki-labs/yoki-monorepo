import type { GetServerSideProps, NextPage } from "next";
import { ReactNode, useState } from "react";
import Turnstile from "react-turnstile";

import LandingPage from "../../components/landing/LandingPage";
import prisma from "../../prisma";
import { VerificationStatus } from "../../utils/verificationUtil";
import PagePlaceholder, { PagePlaceholderIcon } from "../../components/PagePlaceholder";
import { Stack, Typography } from "@mui/joy";

export interface Props {
    id: string | null;
}
export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
    const { verificationId } = ctx.params as { verificationId: string };
    const storedVerification = await prisma.captcha.findFirst({ where: { id: verificationId } });
    return { props: { id: storedVerification?.id ?? null } };
};

const VerificationPage: NextPage<Props> = ({ id }) => {
    const [status, setStatus] = useState<VerificationStatus | null>(null);

    const captchaReq = async (token: string) => {
        const req = await fetch(`/api/verify/${id}`, { method: "POST", body: JSON.stringify({ token }), headers: { "content-type": "application/json" } });

        if (req.ok) setStatus(VerificationStatus.SUCCESS);
        else if (req.status === 403) setStatus(VerificationStatus.BANNED);
        else setStatus(VerificationStatus.FAILED);
    };

    if (status === VerificationStatus.SUCCESS)
        return (
            <VerificationPageWrapper>
                <PagePlaceholder icon={PagePlaceholderIcon.Success} title="Verified!">
                    We are now sure you are not a bot! You should be able to participate in the server.
                </PagePlaceholder>
            </VerificationPageWrapper>
        );
    else if (status === VerificationStatus.FAILED)
        return (
            <VerificationPageWrapper>
                <PagePlaceholder icon={PagePlaceholderIcon.Unexpected} title="Error while verifying">
                    There seems to have been a problem while verifying you. Try again or contact the server staff.
                </PagePlaceholder>
            </VerificationPageWrapper>
        );
    else if (status === VerificationStatus.BANNED)
        return (
            <VerificationPageWrapper>
                <PagePlaceholder icon={PagePlaceholderIcon.NoPermission} title="You're banned from this server">
                    Unfortunately, it seems that you have been banned from this server and you cannot be verified.
                </PagePlaceholder>
            </VerificationPageWrapper>
        );

    return (
        <VerificationPageWrapper>
            <Typography level="h2" gutterBottom>
                Verification
            </Typography>
            <Typography level="body-md" sx={{ mb: 2 }}>
                We are checking whether you're a bot. Please solve the captcha:
            </Typography>
            <Turnstile className="flex justify-center" sitekey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY!} onVerify={(token) => captchaReq(token)} />
        </VerificationPageWrapper>
    );
};

function VerificationPageWrapper({ children }: { children: ReactNode | ReactNode[] }) {
    return (
        <LandingPage>
            <Stack direction="row" alignItems="center" sx={{ flex: "1" }}>
                <Stack direction="column" alignItems="center" sx={{ flex: "1", mb: 40 }}>
                    {children}
                </Stack>
            </Stack>
        </LandingPage>
    );
}

export default VerificationPage;
