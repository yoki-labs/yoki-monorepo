import { AspectRatio, Avatar, Card, CardContent, CardOverflow, Stack, Typography } from "@mui/joy";
import { GuildedClientServer, GuildedServer } from "../../lib/@types/guilded";
import { MouseEventHandler } from "react";
import { SxProps } from "@mui/joy/styles/types";

type Props = {
    name: string;
    avatar?: string | null;
    banner?: string | null;
    url?: string | null;
    onClick?: MouseEventHandler<HTMLDivElement> | undefined;
    sx?: SxProps | undefined;
};

export default function ServerDisplay({ name, avatar, banner, url, onClick, sx }: Props) {
    return (
        <Card className="hoverAbove" sx={{ bgcolor: "background.level1", minWidth: 200, ...sx }} onClick={onClick}>
            <CardOverflow>
                {/* <Stack sx={{ height: "100%" }} direction="row" alignItems="center">
                    <Avatar src={avatar ?? void 0}>{name[0]}</Avatar>
                </Stack> */}
                <AspectRatio ratio="5">
                    <img src={banner ?? void 0} alt={`${name}'s Banner`} />
                </AspectRatio>
                {/* <Avatar sx={{ position: "absolute", left: 16, bottom: 0, transform: "translateY(60%)" }} size="md" src={avatar ?? void 0}>
                    {name[0].toUpperCase()}
                </Avatar> */}
            </CardOverflow>
            <CardContent>
                <Stack gap={2} direction="row">
                    <Avatar size="lg" src={avatar ?? void 0}>
                        {name[0].toUpperCase()}
                    </Avatar>
                    <Stack direction="column">
                        <Typography component="span" level="title-sm">
                            {name}
                        </Typography>
                        {url && (
                            <Stack sx={{ alignItems: "start", flexGrow: "1" }} spacing={2} direction="row">
                                <Typography level="body-md">/{url}</Typography>
                            </Stack>
                        )}
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}
