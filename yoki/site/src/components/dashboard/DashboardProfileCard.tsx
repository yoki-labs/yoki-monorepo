import React from "react";
import { SanitizedServer } from "../../lib/@types/db";
import { AspectRatio, Avatar, Box, Card, CardContent, CardOverflow, Stack, Typography } from "@mui/joy";
import LabsForm, { LabsFormState } from "../LabsForm";
import { LabsFormFieldType } from "../form";
import { timezones } from "@yokilabs/utils";

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
            <Typography level="body2" textColor="text.primary" fontWeight="bolder">
                {premium?.toString() ?? "Free"} tier
            </Typography>
        );
    }

    render() {
        const BotTier = this.BotTier.bind(this);
        const { serverConfig } = this.props;

        return (
            <Card>
                <CardOverflow>
                    <AspectRatio ratio="4">
                        <img src="/banner.png" alt="Yoki's Banner" />
                    </AspectRatio>
                    <Avatar sx={{ "--Avatar-size": "80px", position: "absolute", left: 20, bottom: 0, transform: "translateY(60%)" }} size="lg" src="/icon.png" />
                </CardOverflow>
                <CardContent sx={{ mt: 7 }}>
                    <Box>
                        <BotTier />
                        <Stack direction="row" alignItems="center">
                            <Typography level="h2">Yoki</Typography>
                            <Typography sx={{ ml: 1, px: 1 }} level="h3" fontSize="md" color="neutral" variant="solid">Bot</Typography>
                        </Stack>
                        <Typography level="body2">Meet Yoki, your moderation companion and the biggest moderation bot on Guilded.</Typography>
                    </Box>
                    <DashboardProfileCardForm serverConfig={serverConfig} onSubmit={(state) => console.log("Config changed", state)} />
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