import { Box, Chip, List, ListItem, ListItemDecorator, Stack, Typography } from "@mui/joy";
import { DashboardPageProps } from "../pages";
import React from "react";
import LabsIconCard from "../../LabsIconCard";
import { faCheck, faCheckCircle, faCircleCheck, faHeart } from "@fortawesome/free-solid-svg-icons";
import { PremiumType } from "@prisma/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LabsButton from "../../LabsButton";

const tierPerks: Record<PremiumType | "Copper", string[]> = {
    Copper: [
        "You allow us to continue doing what we love",
        "Faster & more responsive support",
    ],
    [PremiumType.Silver]: [
        "Copper tier perks",
        "Automatically delete NSFW images (if anti-NSFW module is enabled)",
        "Early access to features",
    ],
    [PremiumType.Gold]: [
        "Copper & Silver tier perks",
        "All the future premium perks"
    ],
};

export default class PremiumPage extends React.Component<DashboardPageProps> {
    constructor(props: DashboardPageProps) {
        super(props);
    }

    render() {
        const { serverConfig } = this.props;

        return (
            <Box className="grid sm:grid-cols-1 md:grid-cols-3 xlg:grid-cols-3 gap-7">
                <PremiumTier
                    subscribedIconClassName="from-rose-500 to-orange-500"
                    subscribed={true}
                    tier={"Copper"}
                    price={5}
                    perks={tierPerks.Copper}
                    />
                <PremiumTier
                    subscribedIconClassName="from-cyan-500 to-purple-400"
                    subscribed={true}
                    tier={PremiumType.Silver}
                    price={10}
                    // perks={tierPerks.Copper.concat(...tierPerks.Silver)}
                    perks={tierPerks.Silver}
                    />
                <PremiumTier
                    subscribedIconClassName="from-red-400 to-yellow-500"
                    subscribed={true}
                    tier={PremiumType.Gold}
                    price={20}
                    // perks={tierPerks.Copper.concat(...tierPerks.Silver).concat(...tierPerks.Gold)}
                    perks={tierPerks.Gold}
                    />
            </Box>
        );
    }
}

type PremiumTierProps = {
    tier: PremiumType | "Copper";
    subscribedIconClassName: string,
    subscribed: boolean;
    price: number;
    perks: string[];
};

export function PremiumTier(props: PremiumTierProps) {
    const { price, perks, tier, subscribed, subscribedIconClassName } = props;

    return (
        <LabsIconCard iconAspectRatio={3} orientation="vertical" iconClassName={subscribed ? subscribedIconClassName : undefined} icon={faHeart}>
            <Box>
                <Stack direction="row" alignItems="center" gap={2}>
                    <Typography level="h2">{tier?.toString() ?? "Free"}</Typography>
                    { subscribed && <Chip size="lg" variant="outlined" color="primary">Active</Chip> }
                </Stack>
                <Typography level="h4" textColor="text.secondary">${price.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ flex: "1", mt: 3 }}>
                <Typography level="h5">Tier perks</Typography>
                <List sx={{ p: 0 }}>
                    {perks.map((perk) => (
                        <ListItem sx={{ "--ListItemDecorator-size": "30px" }}>
                            <ListItemDecorator>
                                <FontAwesomeIcon icon={faCheckCircle} />
                            </ListItemDecorator>
                            <Typography lineHeight={1.25} level="body1">{perk}</Typography>
                        </ListItem>
                    ))}
                </List>
            </Box>
            <Box sx={{ mt: 3, width: "100%" }}>
                <LabsButton disabled={subscribed} sx={{ width: "100%" }}>Subscribe</LabsButton>
            </Box>
        </LabsIconCard>
    );
}
