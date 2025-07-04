import { AspectRatio, Avatar, Box, Card, CardContent, CardOverflow, Chip, Stack, styled, Theme, Typography } from "@mui/joy";
import React, { ReactNode } from "react";

export interface Props {
    serverCount: ReactNode;
}

function BotRole() {
    return (
        <Typography level="body-md" textColor="primary.500" fontWeight="bolder">
            Server Protector 4000
        </Typography>
    );
}

const RoleDot = styled(`span`, {
    name: "RoleDot",
})<{ color?: string }>(({ theme, color }) => ({
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
        <Card sx={{ gap: "20px" }} className="hidden md:block w-80 lg:w-[550px]">
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
                            <Stack gap={1} className="flex-col lg:flex-row">
                                <Chip
                                    startDecorator={<RoleDot color="var(--labs-palette-text-primary)" />}
                                    variant="outlined"
                                    sx={(theme) => ({ px: 1, borderStyle: "dashed", borderColor: theme.vars.palette.text.secondary })}
                                >
                                    <Typography component="span" textColor="text.primary">
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
