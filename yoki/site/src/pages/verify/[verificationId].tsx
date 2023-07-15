import type { GetServerSideProps, NextPage } from "next";
import { useState } from "react";
import Turnstile from "react-turnstile";

import { LandingPage } from "../../components/landing/LandingPage";
import prisma from "../../Prisma";

export interface Props {
    id: string | null;
}
export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
    const { verificationId } = ctx.params as { verificationId: string };
    const storedVerification = await prisma.captcha.findFirst({ where: { id: verificationId } });
    return { props: { id: storedVerification?.id ?? null } };
};

const VerificationPage: NextPage<Props> = ({ id }) => {
    const [status, setStatus] = useState<"PENDING" | "SUCCESS" | "FAILED" | "BANNED">("PENDING");

    const captchaReq = async (token: string) => {
        const req = await fetch(`/api/verify/${id}`, { method: "POST", body: JSON.stringify({ token }), headers: { "content-type": "application/json" } });
        if (req.ok) setStatus("SUCCESS");
        else if (req.status === 403) setStatus("BANNED");
        else setStatus("FAILED");
    };

    let response;
    switch (status) {
        case "PENDING": {
            if (id)
                response = (
                    <div>
                        <h1 className="text-white pb-4">Checking to see if you&apos;re a bot...</h1>
                        <Turnstile className="flex justify-center" sitekey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY!} onVerify={(token) => captchaReq(token)} />
                    </div>
                );
            else response = <h1 className="text-red-600">Not a valid verification link.</h1>;

            break;
        }
        case "BANNED": {
            response = <h1 className="text-red-600">You have been banned from this server!</h1>;
            break;
        }
        case "SUCCESS": {
            response = <h1 className="text-green-600">Success! You can now navigate back to the server.</h1>;
            break;
        }
        default: {
            response = <h1 className="text-red-600">There was an error verifying you. Please reach out to server staff for manual verification.</h1>;
        }
    }

    return (
        <>
            <LandingPage>
                <div style={{ height: "50vh" }} className="flex items-center justify-center text-3xl font-bold">
                    {response}
                </div>
            </LandingPage>
        </>
    );
};

export default VerificationPage;
