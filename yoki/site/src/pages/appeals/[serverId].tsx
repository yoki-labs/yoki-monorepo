/* eslint-disable no-alert */
import type { TeamMemberBanPayload } from "@guildedjs/guilded-api-typings";
import type { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { useState } from "react";

import Button from "../../components/Button";
import { LandingPage } from "../../components/landing/LandingPage";
import rest from "../../guilded";
import prisma from "../../prisma";
import { authOptions } from "../api/auth/[...nextauth]";

export interface Props {
    id: string | null;
    enabled: boolean;
    banInfo: TeamMemberBanPayload | null;
    tooRecent: boolean;
}
export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
    const { serverId } = ctx.params as { serverId: string };
    const server = await prisma.server.findFirst({ where: { serverId } });
    const session = await unstable_getServerSession(ctx.req, ctx.res, authOptions);

    if (!server) return { props: { id: null, enabled: false, banInfo: null, tooRecent: false } };
    if (!server.appealsEnabled || !server.appealChannelId) return { props: { id: server.serverId, enabled: false, banInfo: null, tooRecent: false } };
    if (!session?.user.id) return { redirect: { destination: "/auth/signin", permanent: false } };
    const ban = await rest.router.memberBans
        .serverMemberBanRead({ serverId, userId: session.user.id })
        .then((x) => x.serverMemberBan)
        .catch(() => null);

    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const recentAppeal = await prisma.appeal.findMany({ where: { createdAt: { gte: fiveDaysAgo } } });
    return { props: { id: server.serverId, enabled: true, banInfo: ban ?? null, tooRecent: recentAppeal.length > 0 } };
};

const HalfScreenWidth = ({ children }: { children: React.ReactNode }) => (
    <div style={{ height: "50vh" }} className="flex place-items-center text-center">
        {children}
    </div>
);
const AppealPage: NextPage<Props> = ({ id, enabled, banInfo, tooRecent }) => {
    const [status, setStatus] = useState<"LOADING" | "SUCCESS" | "FAILED" | "PENDING">("PENDING");
    const [appealContent, setAppealContent] = useState("");
    const { data: session } = useSession();

    const appealReq = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!session) return alert("Must be logged in to make this request.");
        if (!appealContent) return alert("You must provide a reason for your appeal");

        setStatus("LOADING");
        const req = await fetch(`/api/appeals/${id}`, {
            method: "POST",
            body: JSON.stringify({ appealContent, appealerId: session.user.id }),
            headers: { "content-type": "application/json" },
        });
        if (!req.ok) setStatus("FAILED");
        else setStatus("SUCCESS");
    };

    let response;
    switch (status) {
        case "SUCCESS": {
            response = (
                <HalfScreenWidth>
                    <h1 className="text-green-600">Success! Your appeal was sent in.</h1>
                </HalfScreenWidth>
            );
            break;
        }
        case "FAILED": {
            response = (
                <HalfScreenWidth>
                    <h1 className="text-red-600 text-center">
                        There was an error sending in your appeal.
                        <br />
                        Please reach out to server staff for manual appeal.
                    </h1>
                </HalfScreenWidth>
            );
            break;
        }
        case "LOADING": {
            response = (
                <HalfScreenWidth>
                    <h1 className="text-yellow-600">Sending...</h1>
                </HalfScreenWidth>
            );
            break;
        }
        default: {
            const appealContentLength = appealContent.length;
            response = (
                <form onSubmit={appealReq} className="text-white w-1/2">
                    <h1 className="text-3xl pb-4">Appeal Here</h1>
                    <div className="flex flex-wrap space-y-4">
                        <textarea
                            id="appealContent"
                            placeholder="Why should you be unbanned?"
                            defaultValue={appealContent?.length ? appealContent : ""}
                            maxLength={1000}
                            rows={8}
                            onChange={(data) => setAppealContent(data.target.value)}
                            className="w-full px-3 pt-3 pb-40 rounded-lg border-custom-black bg-custom-black resize-none font-normal"
                        />
                        <p
                            className={`ml-auto text-lg ${appealContentLength === 1000 ? "font-bold" : ""} ${
                                appealContentLength >= 200 ? "text-red-400/70" : appealContentLength >= 100 ? "text-guilded-gilded/70" : "text-guilded-white/70"
                            }`}
                        >
                            {appealContent === null ? 0 : appealContentLength}/1000
                        </p>
                    </div>
                    <div className="pt-2">
                        <Button disabled={appealContentLength < 1}>Send Appeal</Button>
                    </div>
                </form>
            );
        }
    }

    let base = response;
    if (!id)
        base = (
            <HalfScreenWidth>
                <h3 className="text-red-600">That is not a valid server.</h3>
            </HalfScreenWidth>
        );
    else if (!enabled)
        base = (
            <HalfScreenWidth>
                <h3 className="text-red-600">This server does not accept appeals through Yoki.</h3>
            </HalfScreenWidth>
        );
    else if (!banInfo)
        base = (
            <HalfScreenWidth>
                <h3 className="text-yellow-600">You are not banned from this server.</h3>
            </HalfScreenWidth>
        );
    else if (tooRecent)
        base = (
            <HalfScreenWidth>
                <h3 className="text-yellow-600">
                    You have already sent in an appeal recently. <br /> If your appeal goes unanswered, please come back in a week to resend.
                </h3>
            </HalfScreenWidth>
        );

    return (
        <>
            <LandingPage>
                <div className="flex justify-center text-3xl font-bold py-8">{base}</div>
            </LandingPage>
        </>
    );
};

export default AppealPage;
