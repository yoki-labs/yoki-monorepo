import { faAnglesDown, faBan, faImage, faLink } from "@fortawesome/free-solid-svg-icons";
import { Box } from "@mui/joy";
import type { ContentFilter } from "@prisma/client";
import React from "react";
import DashboardModule from "../DashboardModule";
import { DashboardPageProps } from "./page";
import PagePlaceholder, { PagePlaceholderIcon } from "../../PagePlaceholder";

interface State {
}

const dummyPhrases: ContentFilter[] = [
    {
        id: 7,
        serverId: "4R56dNkl",
        content: "example_word",
        severity: "MUTE",
        matching: "WORD",
        creatorId: "Ann6LewA",
        createdAt: new Date(),
        infractionPoints: 5,
    },
];

export default class AutomodPage extends React.Component<DashboardPageProps, State> {
    constructor(props: DashboardPageProps) {
        super(props);
    }

    render() {
        const { serverConfig } = this.props;

        return (
            <>
                <Box className="grid sm:grid-cols-1 md:grid-cols-2 xlg:grid-cols-3 gap-4">
                    <DashboardModule
                        name="NSFW Image Scan"
                        description="Removes any potentially NSFW images from chat and media."
                        icon={faImage}
                        activeClassName="from-pink-500 to-purple-500"
                        isActive={serverConfig.scanNSFW}
                        requiresPremium
                        onToggle={(value) => console.log("Automod toggle NSFW Image scan", value)}
                    />
                    <DashboardModule
                        name="Auto-mod"
                        description="Filters out spam and blacklisted phrases, words or links."
                        icon={faBan}
                        activeClassName="from-red-500 to-pink-500"
                        isActive={serverConfig.filterEnabled}
                        onToggle={(value) => console.log("Automod toggle NSFW Image scan", value)}
                    />
                    <DashboardModule
                        name="Invite Filter"
                        description="Filters out invites in chat."
                        icon={faLink}
                        activeClassName="from-red-500 to-orange-500"
                        isActive={serverConfig.filterInvites}
                        onToggle={(value) => console.log("Automod toggle NSFW Image scan", value)}
                    />
                    <DashboardModule
                        name="Anti-hoist"
                        description="Stops people from putting symbols at the start of their name to put them above everyone else."
                        icon={faAnglesDown}
                        activeClassName="from-green-500 to-yellow-500"
                        isActive={serverConfig.antiHoistEnabled}
                        onToggle={(value) => console.log("Anti-hoist toggle", value)}
                    />
                </Box>
                <PagePlaceholder icon={PagePlaceholderIcon.Wip} title="Work in progress" description="This section has not been done yet. Come back later!" />
            </>
        );
    }
}