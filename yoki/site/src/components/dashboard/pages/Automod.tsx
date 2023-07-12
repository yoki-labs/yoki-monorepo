import { faBroom, faCircleExclamation, faHammer, faImage, faLink, faShoePrints, faTextSlash, faVolumeMute } from "@fortawesome/free-solid-svg-icons";
import { Box, Typography } from "@mui/joy";
import type { ContentFilter } from "@prisma/client";
import React from "react";
import Module from "../Module";
import { PhraseCard } from "../PhraseCard";
const actionTypes = {
    MUTE: faVolumeMute,
    BAN: faHammer,
    KICK: faShoePrints,
    WARN: faCircleExclamation,
    SOFTBAN: faBroom,
};

interface Props {}
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

export default class Automod extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        return (
            <>
                <Box className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Module
                        name="NSFW Image Scan"
                        description="Removes any potentially NSFW images from chat and media."
                        icon={faImage}
                        activeClassName="from-pink-500 to-purple-500"
                        isActive={true}
                        requiresPremium
                    />
                    <Module
                        name="Phrase Filter"
                        description="Blocks certain phrases or words in the server."
                        icon={faTextSlash}
                        activeClassName="from-red-500 to-pink-500"
                        isActive={true}
                    />
                    <Module
                        name="Invite Filter"
                        description="Filters out invites in chat."
                        icon={faLink}
                        activeClassName="from-red-500 to-orange-500"
                        isActive={true}
                    />
                </Box>
                <Box>
                    <Typography level="h4">Blacklisted Phrases</Typography>
                    {dummyPhrases.map(phrase =>
                        <PhraseCard {...phrase} />
                    )}
                </Box>
                <Box>
                    <Typography level="h4">Links</Typography>
                </Box>
            </>
        );
    }
}

const getActionIcon = (action: string) => {
    return actionTypes[action as keyof typeof actionTypes];
};

const transformToDate = (date: Date | null) => {
    return date?.toString().substring(0, 10) ?? "never";
};
