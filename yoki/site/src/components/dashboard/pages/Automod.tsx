import { faImage, faLink, faTextSlash } from "@fortawesome/free-solid-svg-icons";
import { Box } from "@mui/joy";
import type { ContentFilter } from "@prisma/client";
import React from "react";
import Module from "../Module";
import { DashboardPageProps } from "./page";

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

export default class Automod extends React.Component<DashboardPageProps, State> {
    constructor(props: DashboardPageProps) {
        super(props);
    }

    render() {
        const { serverConfig } = this.props;

        return (
            <>
                <Box className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Module
                        name="NSFW Image Scan"
                        description="Removes any potentially NSFW images from chat and media."
                        icon={faImage}
                        activeClassName="from-pink-500 to-purple-500"
                        isActive={serverConfig.scanNSFW}
                        requiresPremium
                        onToggle={(value) => console.log("Automod toggle NSFW Image scan", value)}
                    />
                    <Module
                        name="Phrase Filter"
                        description="Blocks certain phrases or words in the server."
                        icon={faTextSlash}
                        activeClassName="from-red-500 to-pink-500"
                        isActive={serverConfig.filterEnabled}
                        onToggle={(value) => console.log("Automod toggle NSFW Image scan", value)}
                    />
                    <Module
                        name="Invite Filter"
                        description="Filters out invites in chat."
                        icon={faLink}
                        activeClassName="from-red-500 to-orange-500"
                        isActive={serverConfig.filterInvites}
                        onToggle={(value) => console.log("Automod toggle NSFW Image scan", value)}
                    />
                </Box>
            </>
        );
    }
}