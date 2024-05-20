import { Box, Card, CardContent, Typography } from "@mui/joy";
import React from "react";
import DashboardModule from "../DashboardModule";
import { DashboardPageProps } from "../pages";
import LabsForm from "../../form/LabsForm";
import { LabsFormFieldType, LabsFormSectionOrder } from "../../form/form";
import { errorifyResponseError, notifyFetchError } from "../../../utils/errorUtil";
import { channelsToSelectionOptions } from "../channels";
import { GuildedSanitizedChannel } from "../../../lib/@types/guilded";
import { WavingHandRounded } from "@mui/icons-material";

type State = {
    isMounted: boolean;
    serverChannels: GuildedSanitizedChannel[];
};

export default class WelcomePage extends React.Component<DashboardPageProps, State> {
    constructor(props: DashboardPageProps) {
        super(props);

        this.state = { isMounted: false, serverChannels: [] };
    }

    componentDidMount(): unknown {
        // To not re-mount
        if (this.state.isMounted) return;

        this.setState({ isMounted: true });

        return this.fetchWelcomeInfo();
    }

    async modifyServerConfig(welcomeChannel: string | undefined | null) {
        const { serverId } = this.props.serverConfig;

        return fetch(`/api/servers/${serverId}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ welcomeChannel }),
        })
            .then(errorifyResponseError)
            .catch((errorResponse) => notifyFetchError("Error while updating server data for welcome", errorResponse));
    }

    async fetchWelcomeInfo() {
        const { serverId } = this.props.serverConfig;

        return fetch(`/api/servers/${serverId}/channels`, {
            method: "GET",
            headers: { "content-type": "application/json" },
        })
            .then(errorifyResponseError)
            .then((response) => response.json())
            .then(({ serverChannels }: { serverChannels: GuildedSanitizedChannel[] }) => this.setState({ serverChannels }))
            .catch(notifyFetchError.bind(null, "Error while fetching channel data for welcome"));
    }

    render() {
        const { serverConfig } = this.props;
        const { serverChannels } = this.state;

        return (
            <>
                <Box className="grid gap-4">
                    <DashboardModule
                        name="Welcome"
                        description="Greets new verified users."
                        iconComponent={WavingHandRounded}
                        activeClassName="from-indigo-500 to-fuchsia-500"
                        serverConfig={serverConfig}
                        requiresEarlyAccess
                        prop="welcomeEnabled"
                        hideBadges
                        largeHeader
                    />
                </Box>
                <Box>
                    <Typography level="title-lg" gutterBottom>
                        Welcomer configuration
                    </Typography>
                    <Card>
                        <CardContent>
                            <LabsForm
                                id="welcome-page-form"
                                sections={[
                                    {
                                        order: LabsFormSectionOrder.Grid,
                                        fields: [
                                            {
                                                type: LabsFormFieldType.Select,
                                                prop: "welcomeChannel",
                                                name: "Public welcome channel",
                                                description: "Where the welcome messages will be sent.",
                                                defaultValue: serverConfig.welcomeChannel,
                                                selectableValues: channelsToSelectionOptions(serverChannels),
                                                optional: true,
                                            },
                                        ],
                                    },
                                ]}
                                onSubmit={({ welcomeChannel }) => this.modifyServerConfig(welcomeChannel as string | undefined | null)}
                            />
                        </CardContent>
                    </Card>
                </Box>
            </>
        );
    }
}
