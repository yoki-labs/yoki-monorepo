import { Box, Card, CardContent, Typography } from "@mui/joy";
import React from "react";
import DashboardModule from "../DashboardModule";
import { DashboardPageProps } from "../pages";
import { faCommentDots, faDoorOpen, faGlobe, faHashtag, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import LabsForm from "../../form/LabsForm";
import { LabsFormFieldOption, LabsFormFieldType, LabsFormSectionOrder, TimeStep } from "../../form/form";
import { ResponseType } from "@prisma/client";
import { errorifyResponseError, notifyFetchError } from "../../../utils/errorUtil";

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

export default class AntiraidPage extends React.Component<DashboardPageProps> {
    constructor(props: DashboardPageProps) {
        super(props);
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

    render() {
        const { serverConfig } = this.props;

        return (
            <>
                <Box className="grid gap-4">
                    <DashboardModule
                        name="Anti-raid"
                        description="Customize how the bot detects and handles suspicious accounts."
                        icon={faShieldHalved}
                        activeClassName="from-green-500 to-cyan-500"
                        serverConfig={serverConfig}
                        prop="antiRaidEnabled"
                        hideBadges
                        largeHeader
                    />
                </Box>
                <Box>
                    <Typography level="h4" gutterBottom>
                        Anti-raid configuration
                    </Typography>
                    <Card>
                        <CardContent>
                            <LabsForm
                                sections={[
                                    {
                                        order: LabsFormSectionOrder.Grid,
                                        fields: [
                                            {
                                                type: LabsFormFieldType.Text,
                                                prop: "antiRaidChallengeChannel",
                                                name: "Challenge Channel",
                                                description: "For text captchas, this is the channel where text captchas will be sent to.",
                                                placeholder: "Channel ID",
                                                defaultValue: serverConfig.antiRaidChallengeChannel,
                                                prefixIcon: faHashtag,
                                            },
                                            {
                                                type: LabsFormFieldType.Select,
                                                prop: "antiRaidResponse",
                                                name: "Anti-raid Response",
                                                description: "How the recently created accounts will be dealt with.",
                                                defaultValue: serverConfig.antiRaidResponse,
                                                selectableValues: antiRaidResponseValues,
                                            },
                                            {
                                                type: LabsFormFieldType.Time,
                                                prop: "antiRaidAgeFilter",
                                                name: "Filtered Account Age",
                                                description: "The amount of time that account should exist before it's considered recently created and is dealt with anti-raid.",
                                                defaultValue: serverConfig.antiRaidAgeFilter,
                                                step: TimeStep.Days,
                                                max: 14 * 24 * 60 * 60 * 1000,
                                            },
                                        ],
                                    },
                                ]}
                                onSubmit={({ antiRaidChallengeChannel, antiRaidResponse, antiRaidAgeFilter }) =>
                                    this.modifyServerConfig(
                                        antiRaidChallengeChannel as string | undefined | null,
                                        antiRaidResponse as ResponseType | undefined | null,
                                        antiRaidAgeFilter as number | undefined | null
                                    )
                                }
                            />
                        </CardContent>
                    </Card>
                </Box>
            </>
        );
    }
}
