import { IconDefinition, faCheck } from "@fortawesome/free-solid-svg-icons";
import { Box, Button, Card, CardContent, ColorPaletteProp, Link as JoyLink, List, ListItem, ListItemDecorator, Typography } from "@mui/joy";
import AlertIcon from "../AlertIcon";
import Link from "next/link";

type Perk = {
    text: string;
    icon?: IconDefinition;
    color?: ColorPaletteProp;
};

type Props = {
    tierName: string;
    cost: number;
    perks: Perk[];
};

export default function PremiumCard({ tierName, cost, perks }: Props) {
    return (
        <Card>
            <CardContent>
                <Box>
                    <Typography level="h4" textColor="text.secondary">
                        {tierName}
                    </Typography>
                    <Typography level="h2">${cost.toFixed(2)}/month</Typography>
                </Box>
                <Box sx={{ flex: "1", mt: 4 }}>
                    <Typography level="title-md">Tier perks</Typography>
                    <List sx={{ mb: 2 }}>
                        {perks.map((x, i) => (
                            <ListItem
                                key={`premium.${tierName}.perk-${i}`}
                                sx={{ opacity: Number(i < 2) || 1 / i, "--ListItemDecorator-size": "2.5rem", "--ListItem-minHeight": "2.5rem" }}
                            >
                                <ListItemDecorator>
                                    <AlertIcon variant="soft" icon={x.icon ?? faCheck} color={x.color ?? "success"} />
                                </ListItemDecorator>
                                <Typography textColor="text.primary">{x.text}</Typography>
                            </ListItem>
                        ))}
                    </List>
                    <JoyLink onClick={() => window.scrollTo(0, 900)}>See more</JoyLink>
                </Box>
                <Box sx={{ mt: 4, width: "100%" }}>
                    <Link href="/subscribe" style={{ width: "100%", textDecoration: "none" }}>
                        <Button variant="soft" sx={{ width: "100%" }}>
                            Subscribe
                        </Button>
                    </Link>
                </Box>
            </CardContent>
        </Card>
    );
}
