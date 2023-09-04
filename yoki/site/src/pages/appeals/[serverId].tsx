import { GetServerSideProps, GetServerSidePropsResult, NextPage } from "next";
import { getServerSession } from "next-auth";
import React from "react";

import DashForm from "../../components/dashboard/DashForm";
import { GuildedServer } from "../../lib/@types/guilded";
import { methods } from "../../lib/Fetcher";
// import WelcomeBanner from "../../partials/WelcomeBanner";
import { authOptions } from "../api/auth/[...nextauth]";
import prisma, { sanitizeServer } from "../../prisma";
import NoServerPage from "../../components/dashboard/pages/NoServerPage";
import LayoutWrapper from "../../components/dashboard/layout/LayoutWrapper";
import { SanitizedServer } from "../../lib/@types/db";
import Layout from "../../components/dashboard/layout/Layout";
import rest from "../../guilded";
import { RoleType } from "@prisma/client";
import NotPermittedPage from "../../components/dashboard/pages/NotPermittedPage";
import NoEarlyAccessPage from "../../components/dashboard/pages/NoEarlyAccessPage";
import { isHashId } from "@yokilabs/utils";
import { ServerPayload } from "@guildedjs/api";
import { Stack } from "@mui/joy";
import PagePlaceholder, { PagePlaceholderIcon } from "../../components/PagePlaceholder";
import { AppealsSessionProps, appealWaitingTime } from "../../utils/appealUtil";
import { LandingPage } from "../../components/landing/LandingPage";
import AppealsPageDisplay from "../../components/appeals/AppealsPageDisplay";

export const getServerSideProps: GetServerSideProps<AppealsSessionProps> = async (ctx) => {
    const session = await getServerSession(ctx.req, ctx.res, authOptions);
    if (!session?.user.access_token) return { redirect: { destination: "/auth/signin", permanent: false } };

    console.log("Session user", session.user);

    // const servers = await methods(session.user.access_token).get<GuildedServer[]>("https://authlink.guildedapi.com/api/v1/users/@me/servers");
    // if (!servers?.length) return { redirect: { destination: "/auth/signin", permanent: false } };

    // /appeals/:serverId
    const { serverId } = ctx.query;

    // The ID is invalid
    if (!(typeof serverId === "string" && isHashId(serverId)))
        return { redirect: { destination: `/`, permanent: false } };
    // // Already in that server, nothing to appeal for
    // else if (servers.find((x) => x.id === serverId))
    //     return { props: { code: "IN_SERVER", } };

    // Get the server they are appealing for
    const serverInDb = (await prisma.server.findMany({
        where: {
            serverId,
        }
    }))[0];
    
    const user = { name: session.user.name, avatar: session.user.avatar };

    // No server found
    if (!serverInDb)
        return { props: { code: "NOT_FOUND", user } };
    // No ability to appeal
    else if (!(serverInDb.appealsEnabled && serverInDb.appealChannelId))
        return { props: { code: "UNAVAILABLE", user } };

    const guildedServer = await rest.router.servers
        .serverRead({ serverId })
        .then((x) => x.server)
        .catch(() => null);

    // Used to be in that server, but only config exist
    if (!guildedServer)
        return { props: { code: "NOT_FOUND", user } };

    const ban = await rest.router.memberBans
        .serverMemberBanRead({ serverId, userId: session.user.id! })
        .then((x) => x.serverMemberBan)
        .catch(() => null);

    // Can't appeal it if you aren't banned
    if (!ban)
        return { props: { code: "NOT_BANNED", user } };

    const previousAppeals = (await prisma.appeal.findMany({
        orderBy: [{ createdAt: "desc" }],
        where: {
            serverId: serverId,
            creatorId: session.user.id!,
        },
    }));

    const elapsedTime = Date.now() - (previousAppeals[0]?.createdAt.getTime() ?? 0);

    // 5 days haven't been waited through
    if (elapsedTime < appealWaitingTime)
        return { props: { code: "TOO_FAST", user, elapsedTime } };

    return { props: { code: null, user, server: guildedServer } };
};

const AppealPage: NextPage<AppealsSessionProps> = (props) => {
    return (
        <LandingPage>
            <AppealsPageDisplay {...props} />
        </LandingPage>
    )
};

// const HalfScreenWidth = ({ children }: { children: React.ReactNode }) => (
//     <div style={{ height: "50vh" }} className="flex place-items-center text-center">
//         {children}
//     </div>
// );
// const AppealPage: NextPage<Props> = ({ id, enabled, banInfo, tooRecent }) => {
//     const [status, setStatus] = useState<"LOADING" | "SUCCESS" | "FAILED" | "PENDING">("PENDING");
//     const [appealContent, setAppealContent] = useState("");
//     const { data: session } = useSession();

//     const appealReq = async (event: React.FormEvent<HTMLFormElement>) => {
//         event.preventDefault();
//         if (!session) return alert("Must be logged in to make this request.");
//         if (!appealContent) return alert("You must provide a reason for your appeal");

//         setStatus("LOADING");
//         const req = await fetch(`/api/appeals/${id}`, {
//             method: "POST",
//             body: JSON.stringify({ appealContent, appealerId: session.user.id }),
//             headers: { "content-type": "application/json" },
//         });
//         if (!req.ok) setStatus("FAILED");
//         else setStatus("SUCCESS");
//     };

//     let response;
//     switch (status) {
//         case "SUCCESS": {
//             response = (
//                 <HalfScreenWidth>
//                     <h1 className="text-green-600">Success! Your appeal was sent in.</h1>
//                 </HalfScreenWidth>
//             );
//             break;
//         }
//         case "FAILED": {
//             response = (
//                 <HalfScreenWidth>
//                     <h1 className="text-red-600 text-center">
//                         There was an error sending in your appeal.
//                         <br />
//                         Please reach out to server staff for manual appeal.
//                     </h1>
//                 </HalfScreenWidth>
//             );
//             break;
//         }
//         case "LOADING": {
//             response = (
//                 <HalfScreenWidth>
//                     <h1 className="text-yellow-600">Sending...</h1>
//                 </HalfScreenWidth>
//             );
//             break;
//         }
//         default: {
//             const appealContentLength = appealContent.length;
//             response = (
//                 <form onSubmit={appealReq} className="text-white w-1/2">
//                     <h1 className="text-3xl pb-4">Appeal Here</h1>
//                     <div className="flex flex-wrap space-y-4">
//                         <textarea
//                             id="appealContent"
//                             placeholder="Why should you be unbanned?"
//                             defaultValue={appealContent?.length ? appealContent : ""}
//                             maxLength={1000}
//                             rows={8}
//                             onChange={(data) => setAppealContent(data.target.value)}
//                             className="w-full px-3 pt-3 pb-40 rounded-lg border-custom-black bg-custom-black resize-none font-normal"
//                         />
//                         <p
//                             className={`ml-auto text-lg ${appealContentLength === 1000 ? "font-bold" : ""} ${
//                                 appealContentLength >= 200 ? "text-red-400/70" : appealContentLength >= 100 ? "text-guilded-gilded/70" : "text-guilded-white/70"
//                             }`}
//                         >
//                             {appealContent === null ? 0 : appealContentLength}/1000
//                         </p>
//                     </div>
//                     <div className="pt-2">
//                         <Button disabled={appealContentLength < 1}>Send Appeal</Button>
//                     </div>
//                 </form>
//             );
//         }
//     }

//     let base = response;
//     if (!id)
//         base = (
//             <HalfScreenWidth>
//                 <h3 className="text-red-600">That is not a valid server.</h3>
//             </HalfScreenWidth>
//         );
//     else if (!enabled)
//         base = (
//             <HalfScreenWidth>
//                 <h3 className="text-red-600">This server does not accept appeals through Yoki.</h3>
//             </HalfScreenWidth>
//         );
//     else if (!banInfo)
//         base = (
//             <HalfScreenWidth>
//                 <h3 className="text-yellow-600">You are not banned from this server.</h3>
//             </HalfScreenWidth>
//         );
//     else if (tooRecent)
//         base = (
//             <HalfScreenWidth>
//                 <h3 className="text-yellow-600">
//                     You have already sent in an appeal recently. <br /> If your appeal goes unanswered, please come back in a week to resend.
//                 </h3>
//             </HalfScreenWidth>
//         );

//     return (
//         <>
//             <LandingPage>
//                 <div className="flex justify-center text-3xl font-bold py-8">{base}</div>
//             </LandingPage>
//         </>
//     );
// };

export default AppealPage;
