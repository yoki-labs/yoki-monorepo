import React, { ReactNode } from "react";
import { SanitizedServer } from "../../../lib/@types/db";
import { AspectRatio, Avatar, Box, Card, CardContent, CardOverflow, Chip, Stack, Tooltip, Typography } from "@mui/joy";
import LabsForm, { LabsFormState } from "../../LabsForm";
import { LabsFormFieldType } from "../../form";
import { timezones } from "@yokilabs/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRocket } from "@fortawesome/free-solid-svg-icons";
import { labsSecondaryColour } from "../../../styles/theme";

export type Props = {
    serverCount: ReactNode;
};

function BotRole() {
    return (
        <Typography level="body-md" textColor="primary.500" fontWeight="bolder">
            Server Protector 4000
        </Typography>
    );
}

function ProfileCardSection({ title, children }: { title: string; children: ReactNode | ReactNode[]; }) {
    return (
        <Stack component="section" gap={0.6}>
            <Typography level="body-md" fontWeight="bolder" textColor="text.secondary">{title}</Typography>
            <Box>{ children }</Box>
        </Stack>
    );
}

export default function LandingProfileCard({ serverCount }: Props) {
    return (
        <Card sx={{ maxWidth: 650 }}>
            <CardOverflow>
                <AspectRatio ratio="5">
                    <img src="/banner.png" alt="Yoki's Banner" />
                </AspectRatio>
                <Avatar sx={{ "--Avatar-size": "80px", position: "absolute", left: 30, bottom: 0, transform: "translateY(60%)" }} size="lg" src="/icon.png" />
            </CardOverflow>
            <CardContent>
                <Box sx={{ mt: 6, py: 0.5, px: 1.5 }}>
                    <Box>
                        <BotRole />
                        <Stack direction="row" alignItems="center" sx={{ my: 1 }}>
                            <Typography level="h2">Yoki</Typography>
                            <Typography sx={{ ml: 1, px: 1 }} level="h3" fontSize="md" color="neutral" variant="solid">Bot</Typography>
                        </Stack>
                        <Typography level="body-md">Meet Yoki, your moderation companion and the biggest moderation bot on Guilded.</Typography>
                    </Box>
                    <Stack mt={3} gap={3}>
                        <ProfileCardSection title="Status">
                            <Typography level="body-md" textColor="text.primary">Keeping {serverCount} servers safe</Typography>
                        </ProfileCardSection>
                        <ProfileCardSection title="Roles">
                            <Stack direction="row" gap={1}>
                                <Chip
                                    startDecorator={<span style={{ width: 20, height: 20, borderRadius: "100%", backgroundColor: "white" }}></span>}
                                    variant="outlined"
                                    sx={{ px: 1, borderStyle: "dashed", borderColor: "white", color: "white" }}
                                >
                                    <Typography component="span" textColor="white">Admin</Typography>
                                </Chip>
                                <Chip
                                    startDecorator={<span style={{ width: 20, height: 20, borderRadius: "100%", backgroundImage: `linear-gradient(to left, ${labsSecondaryColour[0]}, ${labsSecondaryColour[1]})` }}></span>}
                                    variant="outlined"
                                >
                                    <Typography component="span" textColor="primary.500">Server Protector 4000</Typography>
                                </Chip>
                            </Stack>
                        </ProfileCardSection>
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    );
}