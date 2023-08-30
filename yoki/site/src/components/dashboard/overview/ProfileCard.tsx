import React from "react";
import { SanitizedServer } from "../../../lib/@types/db";
import { AspectRatio, Avatar, Box, Card, CardContent, CardOverflow, Stack, Tooltip, Typography } from "@mui/joy";
import LabsForm, { LabsFormState } from "../../LabsForm";
import { LabsFormFieldType } from "../../form";
import { timezones } from "@yokilabs/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRocket } from "@fortawesome/free-solid-svg-icons";

export type Props = {
    serverConfig: SanitizedServer;
};

export default class DashboardProfileCard extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    BotTier() {
        const { premium } = this.props.serverConfig;

        return (
            <Typography level="body-md" textColor="text.primary" fontWeight="bolder">
                {premium?.toString() ?? "Free"} tier
            </Typography>
        );
    }

    onServerUpdate(prefix: string | null, timezone: string | null) {
        const { serverId } = this.props.serverConfig;

        console.log("Server update", { prefix, timezone });

        return fetch(`/api/servers/${serverId}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ prefix, timezone })
        })
    }

    render() {
        const BotTier = this.BotTier.bind(this);
        const { serverConfig } = this.props;

        return (
            <Card sx={{ maxWidth: 650 }}>
                <CardOverflow>
                    <AspectRatio ratio="5">
                        <img src="/banner.png" alt="Yoki's Banner" />
                    </AspectRatio>
                    <Avatar sx={{ "--Avatar-size": "80px", position: "absolute", left: 30, bottom: 0, transform: "translateY(60%)" }} size="lg" src="/icon.png" />
                </CardOverflow>
                <CardContent>
                    <Stack sx={{ mt: 1, height: 24 }} direction="row-reverse">
                        { serverConfig.earlyaccess &&
                            <Tooltip title="Yoki Early Access" color="neutral">
                                <FontAwesomeIcon icon={faRocket} style={{ width: 24, height: 24, }} />
                            </Tooltip>
                        }
                    </Stack>
                    <Box sx={{ mt: 3, py: 0.5, px: 1.5 }}>
                        <Box>
                            <BotTier />
                            <Stack direction="row" alignItems="center">
                                <Typography level="h2">Yoki</Typography>
                                <Typography sx={{ ml: 1, px: 1 }} level="h3" fontSize="md" color="neutral" variant="solid">Bot</Typography>
                            </Stack>
                            <Typography level="body-md">Meet Yoki, your moderation companion and the biggest moderation bot on Guilded.</Typography>
                        </Box>
                        <DashboardProfileCardForm serverConfig={serverConfig} onSubmit={({ values: { prefix, timezone } }) => this.onServerUpdate(prefix as string | null, timezone as string | null)} />
                    </Box>
                </CardContent>
            </Card>
        );
    }
}

function DashboardProfileCardForm(props: { onSubmit: (state: LabsFormState) => unknown | Promise<unknown>; serverConfig: SanitizedServer; }) {
    const { serverConfig, onSubmit } = props;

    return (
        <Box sx={{ mt: 2 }}>
            <LabsForm
                onSubmit={onSubmit}
                alwaysDisplayActions
                sections={[
                    {
                        fields: [
                            {
                                prop: "prefix",
                                name: "Bot prefix",
                                defaultValue: serverConfig.prefix,
                                placeholder: "?",
                                type: LabsFormFieldType.Text,
                                description: "The prefix that Yoki uses to recognize commands.",
                            },
                            {
                                prop: "language",
                                name: "Language",
                                description: "The language Yoki responds in.",
                                type: LabsFormFieldType.Select,
                                defaultValue: serverConfig.locale ?? "en-US",
                                disabled: true,
                                badge: { text: "WIP", color: "primary" },
                                selectableValues: [
                                    {
                                        name: "English (US)",
                                        value: "en-US",
                                    },
                                ],
                            },
                            {
                                prop: "timezone",
                                name: "Timezone",
                                type: LabsFormFieldType.Select,
                                defaultValue: serverConfig.timezone ?? "america/new_york",
                                selectableValues: timezones.map((timezone) => ({ name: timezone, value: timezone })),
                                description: "The timezone Yoki displays time in.",
                            },
                        ]
                    }
                ]}
            />
        </Box>
    )
}