import { Box, Button, Card, CardContent, Chip, List, ListItem, ListItemDecorator, Stack, Step, StepIndicator, Stepper, Typography } from "@mui/joy";
import { DashboardPageProps } from "../pages";
import React, { ReactNode } from "react";
import LabsIconCard from "../../LabsIconCard";
import { IconDefinition, faCheck, faCheckCircle, faCirclePlus, faEyeSlash, faHeart, faPaintBrush, faStar, faTimes, faTruckFast } from "@fortawesome/free-solid-svg-icons";
import { PremiumType } from "@prisma/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "../../Link";
import NextLink from "next/link";

const noPremiumColours = `var(--labs-palette-neutral-700), var(--labs-palette-neutral-500)`;

// const tierColours: Record<PremiumType, string> = {
//     [PremiumType.Copper]: `var(--labs-palette-warning-300), var(--labs-palette-warning-800)`,
//     [PremiumType.Silver]: `var(--labs-palette-primary-300), var(--labs-palette-primary-800)`,
//     [PremiumType.Gold]: `var(--labs-palette-warning-200), var(--labs-palette-warning-500)`,
// };
const tierLevels: Record<PremiumType, number> = {
    [PremiumType.Copper]: 1,
    [PremiumType.Silver]: 2,
    [PremiumType.Gold]: 3,
};

export default class PremiumPage extends React.Component<DashboardPageProps> {
    constructor(props: DashboardPageProps) {
        super(props);
    }

    render() {
        const { serverConfig } = this.props;
        const { premium } = serverConfig;
        const premiumLevel = premium ? tierLevels[premium] : 0;

        return (
            <Box>
                <Typography level="h3" textColor="warning.300" sx={{ mb: 1 }}>
                    Premium
                </Typography>
                <Typography level="title-md" textColor="text.secondary" sx={{ mb: 2 }}>
                    Premium allows you to receive additional perks and benefits in this server. Subscribe on Yoki Labs Guilded server and enjoy premium features.
                </Typography>
                <NextLink href="/subscribe">
                    <Button variant="soft" color="warning" size="lg" disabled={premium === PremiumType.Gold} sx={{ mb: 6 }}>
                        Subscribe
                    </Button>
                </NextLink>
                <Stepper orientation="vertical" sx={{ width: "100%" }} size="lg">
                    <Step indicator={<PremiumStepIndicator active={true} />} sx={{ "::after": { bgcolor: "primary.700" } }}>
                        <Typography level="title-md" textColor="text.primary" fontWeight="bolder">
                            Free
                        </Typography>
                        <Typography level="body-md" textColor="text.secondary" fontWeight="normal">
                            No additional perks.
                        </Typography>
                    </Step>
                    <PremiumLevelStep
                        key="premium-level.copper"
                        name="Copper"
                        active={premiumLevel > 0}
                        perks={[
                            {
                                text: "Bot customizations",
                                icon: faPaintBrush,
                            },
                            {
                                text: "Faster support",
                                icon: faTruckFast,
                            },
                            {
                                text: "6 currencies, 20 income commands, 35 items",
                                icon: faCirclePlus,
                            },
                        ]}
                    />
                    <PremiumLevelStep
                        key="premium-level.silver"
                        name="Silver"
                        active={premiumLevel > 1}
                        perks={[
                            {
                                text: "NSFW image filter",
                                icon: faEyeSlash,
                            },
                            {
                                text: "8 currencies, 30 income commands, 45 items",
                                icon: faCirclePlus,
                            },
                        ]}
                    />
                    <PremiumLevelStep
                        key="premium-level.gold"
                        name="Gold"
                        active={premiumLevel > 2}
                        perks={[
                            {
                                text: "12 currencies, 50 income commands, 60 items",
                                icon: faCirclePlus,
                            },
                        ]}
                    />
                </Stepper>
            </Box>
        );
    }
}

function PremiumLevelStep({ name, perks, active }: { name: string; active: boolean; perks: Array<{ text: string; icon: IconDefinition }> }) {
    return (
        <Step indicator={<PremiumStepIndicator active={active} />} sx={{ "::after": active ? { bgcolor: "primary.700" } : undefined }}>
            <Typography level="title-md" textColor={active ? "text.primary" : "text.secondary"} fontWeight="bolder" sx={{ mt: 1 }} gutterBottom>
                {name}
            </Typography>
            <Stack direction="column" sx={{ opacity: active ? 1 : 0.6 }}>
                <Typography level="title-md" textColor="text.secondary">
                    Perks
                </Typography>
                <List sx={{ "--ListDivider-gap": 0, mb: 1 }}>
                    {perks.map((perk, i) => (
                        <ListItem key={`premium-level.${name}.perk.${i}`}>
                            <ListItemDecorator>
                                <FontAwesomeIcon icon={perk.icon} />
                            </ListItemDecorator>
                            {perk.text}
                        </ListItem>
                    ))}
                </List>
                <Link href="/premium" color="primary">
                    See more
                </Link>
            </Stack>
        </Step>
    );
}

function PremiumStepIndicator({ active }: { active: boolean }) {
    return (
        <StepIndicator variant={active ? "solid" : "soft"} color={active ? "primary" : "neutral"} sx={{ bgcolor: active ? "primary.600" : "neutral.800" }}>
            <FontAwesomeIcon icon={active ? faCheck : faTimes} />
        </StepIndicator>
    );
}
