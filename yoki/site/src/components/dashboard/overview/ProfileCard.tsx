import React from "react";
import { SanitizedServer } from "../../../lib/@types/db";
import { AspectRatio, Avatar, Box, Card, CardContent, CardOverflow, Stack, Tooltip, Typography } from "@mui/joy";
import LabsForm, { LabsFormFieldValueMap } from "../../form/LabsForm";
import { LabsFormFieldType } from "../../form/form";
import { timezones } from "@yokilabs/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRocket } from "@fortawesome/free-solid-svg-icons";
import { errorifyResponseError, notifyFetchError } from "../../../utils/errorUtil";
import { PremiumType } from "@prisma/client";
import { TextColor } from "@mui/joy/styles/types";

export type Props = {
    serverConfig: SanitizedServer;
};

export default class DashboardProfileCard extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    onServerUpdate(prefix: string | null, timezone: string | null) {
        const { serverId } = this.props.serverConfig;

        return fetch(`/api/servers/${serverId}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ prefix, timezone }),
        })
            .then(errorifyResponseError)
            .catch(notifyFetchError.bind(null, "Error while updating server data"));
    }

    render() {
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
                        {serverConfig.earlyaccess && (
                            <Tooltip title="Yoki Early Access" color="neutral">
                                <FontAwesomeIcon icon={faRocket} style={{ width: 24, height: 24 }} />
                            </Tooltip>
                        )}
                    </Stack>
                    <Box sx={{ mt: 3, py: 0.5, px: 1.5 }}>
                        <Box>
                            <BotTier tier={serverConfig.premium} />
                            <Stack direction="row" alignItems="center">
                                <Typography level="h2">Yoki</Typography>
                                <Typography sx={{ ml: 1, px: 1, borderRadius: 6 }} level="h3" fontSize="md" color="neutral" variant="solid">
                                    BOT
                                </Typography>
                            </Stack>
                            <Typography level="body-md">Meet Yoki, your moderation companion and the biggest moderation bot on Guilded.</Typography>
                        </Box>
                        <DashboardProfileCardForm
                            serverConfig={serverConfig}
                            onSubmit={({ prefix, timezone }) => this.onServerUpdate(prefix as string | null, timezone as string | null)}
                        />
                    </Box>
                </CardContent>
            </Card>
        );
    }
}

const tierToColour: Record<PremiumType, TextColor> = {
    [PremiumType.Gold]: "warning.300",
    [PremiumType.Silver]: "primary.300",
};

function BotTier({ tier }: { tier: PremiumType | null }) {
    return (
        <Typography level="body-lg" textColor={tier ? tierToColour[tier] : "text.primary"} fontWeight="bolder">
            {tier?.toString() ?? "Free"} tier
        </Typography>
    );
}

function DashboardProfileCardForm(props: { onSubmit: (values: LabsFormFieldValueMap) => unknown | Promise<unknown>; serverConfig: SanitizedServer }) {
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
                                selectableValues: timezones.map((timezone) => ({ name: normalizeTimezoneName(timezone), value: timezone })),
                                description: "The timezone Yoki displays time in.",
                            },
                        ],
                    },
                ]}
            />
        </Box>
    );
}

const normalizeTimezoneName = (timezone: string): string => {
    const [region, place] = timezone.split("/");

    return `${place
        .split("_")
        .map((x) => normalizeTimezonePart(x))
        .join(" ")}, ${normalizeTimezonePart(region)}`;
};

const normalizeTimezonePart = (timezoneWord: string) => timezoneWord[0].toUpperCase() + timezoneWord.slice(1);
