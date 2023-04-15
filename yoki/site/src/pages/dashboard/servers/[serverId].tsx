import { gql } from "graphql-request";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import { useQuery } from "react-query";

import { Setting } from "../../../components/dashboard/menus/Setting";
import Header from "../../../partials/Header";
import Sidebar from "../../../partials/Sidebar";
import { gqlClientContext } from "../../../utils/gqlContext";

const getServer = gql`
    query Content($where: ServerWhereUniqueInput!) {
        getServer(where: $where) {
            id
            serverId
            premium
            blacklisted
            flags
            prefix
            locale
            timezone
            botJoinedAt
            createdAt
            updatedAt
            muteRoleId
            linkSeverity
            linkInfractionPoints
            spamInfractionPoints
            muteInfractionThreshold
            muteInfractionDuration
            kickInfractionThreshold
            banInfractionThreshold
            softbanInfractionThreshold
            antiRaidEnabled
            antiRaidResponse
            antiRaidAgeFilter
            antiRaidChallengeChannel
            memberRoleId
            appealChannelId
            appealsEnabled
            modmailEnabled
            modmailGroupId
            modmailCategoryId
            modmailPingRoleId
            filterEnabled
            filterOnMods
            filterInvites
            antiHoistEnabled
            urlFilterIsWhitelist
            scanNSFW
            spamFrequency
            spamMentionFrequency
        }
    }
`;

export default function ServerPage() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const gqlClient = useContext(gqlClientContext);

    const { data, isSuccess, error } = useQuery(
        "server",
        () => {
            return gqlClient.request(getServer, { where: { serverId: router.query.serverId } });
        },
        { enabled: router.isReady, retry: false }
    );

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* Content area */}
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-custom-gray">
                {/*  Site header */}
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main>
                    <div className="px-4 sm:px-6 lg:px-8 py-12 w-full max-w-9xl mx-auto">{isSuccess ? <Setting server={(data as any).getServer} /> : "Loading..."}</div>
                </main>
            </div>
        </div>
    );
}
