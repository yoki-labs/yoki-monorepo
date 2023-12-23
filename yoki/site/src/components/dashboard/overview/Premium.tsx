import { Box, Button, Card, CardContent, Chip, List, ListItem, ListItemDecorator, Stack, Typography } from "@mui/joy";
import { DashboardPageProps } from "../pages";
import React from "react";
import LabsIconCard from "../../LabsIconCard";
import { faCheckCircle, faHeart } from "@fortawesome/free-solid-svg-icons";
import { PremiumType } from "@prisma/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

const noPremiumColours = `var(--labs-palette-neutral-700), var(--labs-palette-neutral-500)`;

const tierColours: Record<PremiumType, string> = {
    [PremiumType.Copper]: `var(--labs-palette-warning-300), var(--labs-palette-warning-800)`,
    [PremiumType.Silver]: `var(--labs-palette-primary-300), var(--labs-palette-primary-800)`,
    [PremiumType.Gold]: `var(--labs-palette-warning-200), var(--labs-palette-warning-500)`,
};

export default class PremiumPage extends React.Component<DashboardPageProps> {
    constructor(props: DashboardPageProps) {
        super(props);
    }

    render() {
        const { serverConfig } = this.props;
        const { premium } = serverConfig;

        return (
            <Box>
                <Typography level="h3" textColor="warning.300" sx={{ mb: 1 }}>
                    Premium
                </Typography>
                <Typography level="title-md" textColor="text.secondary" sx={{ mb: 4 }}>
                    Premium allows you to receive additional perks and benefits in this server. Subscribe on Yoki Labs Guilded server and enjoy premium features.
                </Typography>
                <Box sx={(theme) => ({ borderRadius: theme.vars.radius.lg, background: `linear-gradient(to bottom right, ${premium ? tierColours[premium] : noPremiumColours})`, p: 0.5 })}>
                    <Card>
                        <CardContent>
                            {
                                premium === PremiumType.Gold
                                ? <Box>
                                        <Typography level="title-lg" gutterBottom>This server has the highest tier of Yoki Labs subscription (Gold)</Typography>
                                        <Typography level="body-md">There is nothing to upgrade to.</Typography>
                                </Box>
                                : premium
                                ? <>
                                    <Box>
                                        <Typography level="title-lg" gutterBottom>This server has {premium} tier of Yoki Labs subscription</Typography>
                                        <Typography level="body-md">All the tier perks will be available for this. You can upgrade to receive even more.</Typography>
                                    </Box>
                                    <Box mt={2}>
                                        <Link href="/premium">
                                            <Button variant="soft" color="warning">
                                                Upgrade
                                            </Button>
                                        </Link>
                                    </Box>
                                </>
                                : <>
                                    <Box>
                                        <Typography level="title-lg" gutterBottom>This server does not have Yoki Labs subscription</Typography>
                                        <Typography level="body-md">No additional perks will be received. You can upgrade to premium to receive more features and other perks.</Typography>
                                    </Box>
                                    <Box mt={2}>
                                        <Link href="/premium">
                                            <Button variant="soft" color="warning">
                                                Subscribe
                                            </Button>
                                        </Link>
                                    </Box>
                                </>
                            }
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        );
    }
}
