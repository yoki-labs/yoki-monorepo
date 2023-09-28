import React, { ReactNode } from "react";
import { AspectRatio, Avatar, Box, Card, CardContent, CardOverflow, Chip, Stack, Typography, styled } from "@mui/joy";

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

const RoleDot = styled(`span`)<{ color?: string }>(({ theme, color }) => ({
    width: 20,
    height: 20,
    borderRadius: "100%",
    backgroundColor: color ?? theme.vars.palette.primary[500],
}));

function ProfileCardSection({ title, children }: { title: string; children: ReactNode | ReactNode[] }) {
    return (
        <Stack component="section" gap={0.6}>
            <Typography level="body-md" fontWeight="bolder" textColor="text.secondary">
                {title}
            </Typography>
            <Box>{children}</Box>
        </Stack>
    );
}

export default function LandingProfileCard({ serverCount }: Props) {
    return (
        <Card sx={{ maxWidth: 650, minWidth: 600 }} className="hidden md:block">
            <CardOverflow>
                <AspectRatio ratio="5">
                    <img src="/banner.png" alt="Yoki's Banner" />
                </AspectRatio>
                <Avatar sx={{ "--Avatar-size": "80px", position: "absolute", left: 30, bottom: 0, transform: "translateY(60%)" }} size="lg" src="/icon.png" />
            </CardOverflow>
            <CardContent>
                <Box sx={{ mt: 7.5, py: 0.5, px: 1.5 }}>
                    <Box>
                        <BotRole />
                        <Stack direction="row" alignItems="center" sx={{ my: 1 }}>
                            <Typography level="h2">Yoki</Typography>
                            <Typography sx={{ ml: 1, px: 1 }} level="h3" fontSize="md" color="neutral" variant="solid">
                                BOT
                            </Typography>
                        </Stack>
                        <Typography level="body-md">The biggest moderation bot on Guilded.</Typography>
                    </Box>
                    <Stack mt={3} gap={3}>
                        <ProfileCardSection title="Status">
                            <Typography level="body-md" textColor="text.primary">
                                Keeping {serverCount}+ servers safe
                            </Typography>
                        </ProfileCardSection>
                        <ProfileCardSection title="Roles">
                            <Stack direction="row" gap={1}>
                                <Chip startDecorator={<RoleDot color="white" />} variant="outlined" sx={{ px: 1, borderStyle: "dashed", borderColor: "white", color: "white" }}>
                                    <Typography component="span" textColor="white">
                                        Admin
                                    </Typography>
                                </Chip>
                                <Chip startDecorator={<RoleDot />} variant="outlined" color="primary">
                                    <Typography component="span" textColor="primary.500">
                                        Server Protector 4000
                                    </Typography>
                                </Chip>
                            </Stack>
                        </ProfileCardSection>
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    );
}
