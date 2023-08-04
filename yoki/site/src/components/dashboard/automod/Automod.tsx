import { faAnglesDown, faBan, faImage, faLink } from "@fortawesome/free-solid-svg-icons";
import { Box, Typography } from "@mui/joy";
import React from "react";
import DashboardModule from "../DashboardModule";
import { DashboardPageProps } from "../pages";
import PagePlaceholder, { PagePlaceholderIcon } from "../../PagePlaceholder";
import AutomodPreset from "./AutomodPreset";
import { SanitizedPreset } from "../../../lib/@types/db";

type State = {
    isLoaded: boolean;
    presets: SanitizedPreset[];
}

export default class AutomodPage extends React.Component<DashboardPageProps, State> {
    constructor(props: DashboardPageProps) {
        super(props);

        this.state = { isLoaded: false, presets: [] };
    }

    async componentDidMount(): Promise<void> {
        const { serverConfig: { serverId } } = this.props;
        await fetch(`/api/servers/${serverId}/presets`, {
            method: "GET",
            headers: { "content-type": "application/json" },
        })
            .then((response) => {
                if (!response.ok)
                    throw response;
                return response.json();
            })
            .then(({ presets }) => this.setState({ isLoaded: true, presets }))
            .catch((errorResponse) => console.error("Error while fetching data:", errorResponse));
    }

    render() {
        const { serverConfig } = this.props;
        const { isLoaded, presets } = this.state;

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
                <Typography level="h3" gutterBottom>Presets</Typography>
                <Box className="grid sm:grid-cols-1 md:grid-cols-2 xlg:grid-cols-3 gap-4">
                    <AutomodPreset
                        presetName="profanity"
                        title="Profanity"
                        description="Basic swear words such as 'shit' and 'bitch'."
                        preset={presets.find((x) => x.preset === "profanity")}
                        />
                    <AutomodPreset
                        presetName="slurs"
                        title="Slurs"
                        description="Racial and slurs targetted towards groups of individuals."
                        preset={presets.find((x) => x.preset === "slurs")}
                        />
                    <AutomodPreset
                        presetName="sexual"
                        title="Sexual"
                        description="Words relating to sexual activity or objects."
                        preset={presets.find((x) => x.preset === "sexual")}
                        />
                    <AutomodPreset
                        presetName="sexual-links"
                        title="Sexual Links"
                        description="Link of websites relating to sexual activity."
                        preset={presets.find((x) => x.preset === "sexual-links")}
                        />
                </Box>
                <PagePlaceholder icon={PagePlaceholderIcon.Wip} title="Work in progress" description="This section has not been done yet. Come back later!" />
            </>
        );
    }
}