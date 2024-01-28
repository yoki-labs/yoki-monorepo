import { Box, Card, CardContent, Typography } from "@mui/joy";
import React from "react";
import DashboardModule from "../DashboardModule";
import { DashboardPageProps } from "../pages";
import { faCommentDots, faDoorOpen, faGlobe, faShieldHalved, faUserSecret } from "@fortawesome/free-solid-svg-icons";
import LabsForm from "../../form/LabsForm";
import { LabsFormFieldOption, LabsFormFieldType, LabsFormSectionOrder, TimeStep } from "../../form/form";
import { ResponseType, RoleType } from "@prisma/client";
import { errorifyResponseError, notifyFetchError } from "../../../utils/errorUtil";
import { channelsToSelectionOptions } from "../channels";
import { GuildedSanitizedChannel } from "../../../lib/@types/guilded";
import PagePlaceholder, { PagePlaceholderIcon } from "../../PagePlaceholder";

type State = {
    isMounted: boolean;
    serverChannels: GuildedSanitizedChannel[];
};

const antiRaidResponseValues: LabsFormFieldOption<ResponseType>[] = [
    {
        name: "Text Captcha",
        value: ResponseType.TEXT_CAPTCHA,
        description: "Prompts user to fill in captcha in the designated captcha channel.",
        icon: faCommentDots,
    },
    {
        name: "Site Captcha",
        value: ResponseType.SITE_CAPTCHA,
        description: "Prompts user to fill in captcha on Yoki's website.",
        icon: faGlobe,
    },
    {
        name: "Kick",
        description: "Kicks out the recently created account.",
        icon: faDoorOpen,
        value: ResponseType.KICK,
    },
];

export default class AntinukePage extends React.Component<DashboardPageProps, State> {
    constructor(props: DashboardPageProps) {
        super(props);

        this.state = { isMounted: false, serverChannels: [] };
    }

    componentDidMount(): unknown {
        // To not re-mount
        if (this.state.isMounted) return;

        this.setState({ isMounted: true });

        return this.fetchAntiraidInfo();
    }

    async modifyServerConfig(antiRaidChallengeChannel: string | undefined | null, antiRaidResponse: ResponseType | undefined | null, antiRaidAgeFilter: number | undefined | null) {
        const { serverId } = this.props.serverConfig;

        return fetch(`/api/servers/${serverId}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ antiRaidChallengeChannel, antiRaidResponse, antiRaidAgeFilter }),
        })
            .then(errorifyResponseError)
            .catch((errorResponse) => notifyFetchError("Error while updating server data for antiraid", errorResponse));
    }

    async fetchAntiraidInfo() {
        const { serverId } = this.props.serverConfig;

        return fetch(`/api/servers/${serverId}/channels`, {
            method: "GET",
            headers: { "content-type": "application/json" },
        })
            .then(errorifyResponseError)
            .then((response) => response.json())
            .then(({ serverChannels }) => this.setState({ serverChannels }))
            .catch(notifyFetchError.bind(null, "Error while fetching channel data for anti-raid"));
    }

    render() {
        const { serverConfig } = this.props;
        const { serverChannels } = this.state;

        return (
            <>
                <Box className="grid gap-4">
                    <DashboardModule
                        name="Anti-nuke"
                        description="Customize how rogue moderators are handled."
                        icon={faUserSecret}
                        activeClassName="from-pink-500 to-violet-500"
                        serverConfig={serverConfig}
                        prop="antiRaidEnabled"
                        requiresEarlyAccess
                        hideBadges
                        largeHeader
                    />
                </Box>
                <Box>
                    <Typography level="h4" gutterBottom>
                        Anti-nuke configuration
                    </Typography>
                    <PagePlaceholder icon={PagePlaceholderIcon.Wip} title="Work in progress">
                        This section has not been done yet. Come back later!
                    </PagePlaceholder>
                </Box>
            </>
        );
    }
}
