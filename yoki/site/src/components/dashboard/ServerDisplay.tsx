import { AspectRatio, Avatar, Card, CardContent, CardOverflow, Stack, Typography } from "@mui/joy";
import { GuildedClientServer, GuildedServer } from "../../lib/@types/guilded";
import { MouseEventHandler } from "react";
import { SxProps } from "@mui/joy/styles/types";
import { guildedAwsCdnDomain, guildedCdnDomain } from "../../utils/userUtil";
import FakeImage from "../stylistic/FakeImage";

type Props = {
    id: string;
    name: string;
    avatar?: string | null;
    banner?: string | null;
    url?: string | null;
    onClick?: MouseEventHandler<HTMLDivElement> | undefined;
    sx?: SxProps | undefined;
};

export default function ServerDisplay({ id, name, avatar, banner, url, onClick, sx }: Props) {
    return (
        <Card className="hoverAbove" sx={{ bgcolor: "background.level1", minWidth: 200, ...sx }} onClick={onClick}>
            <CardOverflow>
                {/* <Stack sx={{ height: "100%" }} direction="row" alignItems="center">
                    <Avatar src={avatar ?? void 0}>{name[0]}</Avatar>
                </Stack> */}
                {banner ? (
                    <AspectRatio ratio="5">
                        <img src={banner.replace(guildedAwsCdnDomain, guildedCdnDomain) ?? void 0} alt={`${name}'s Banner`} />
                    </AspectRatio>
                ) : (
                    <FakeImage ratio="5" number={id.charCodeAt(0) % 10} />
                )}
                {/* <Avatar sx={{ position: "absolute", left: 16, bottom: 0, transform: "translateY(60%)" }} size="md" src={avatar ?? void 0}>
                    {name[0].toUpperCase()}
                </Avatar> */}
            </CardOverflow>
            <CardContent>
                <Stack gap={2} direction="row">
                    <Avatar size="lg" src={avatar?.replace(guildedAwsCdnDomain, guildedCdnDomain) ?? void 0} sx={{ bgcolor: "neutral.700" }}>
                        {name[0].toUpperCase()}
                    </Avatar>
                    {url ? (
                        <Stack direction="column">
                            <Typography component="span" level="title-sm">
                                {name}
                            </Typography>
                            <Stack sx={{ mt: 0.25, alignItems: "start", flexGrow: "1" }} spacing={2} direction="row">
                                <Typography level="body-md">/{url}</Typography>
                            </Stack>
                        </Stack>
                    ) : (
                        <Stack direction="row" alignItems="center">
                            <Typography component="span" level="title-sm">
                                {name}
                            </Typography>
                        </Stack>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
}
