import { Avatar, Card, CardContent, CardOverflow, Stack, Typography } from "@mui/joy";
import { GuildedClientServer, GuildedServer } from "../../lib/@types/guilded";
import { MouseEventHandler } from "react";
import { SxProps } from "@mui/joy/styles/types";

type Props = {
    name: string;
    avatar?: string | null;
    url?: string | null;
    onClick?: MouseEventHandler<HTMLDivElement> | undefined;
    sx?: SxProps | undefined;
};

export default function ServerDisplay({ name, avatar, url, onClick, sx }: Props) {
    return (
        <Card sx={{ bgcolor: "background.level1", minWidth: 200, ...sx }} onClick={onClick} orientation="horizontal">
            <CardOverflow sx={{ pl: 2 }}>
                <Stack sx={{ height: "100%" }} direction="row" alignItems="center">
                    <Avatar src={avatar ?? void 0}>{name[0]}</Avatar>
                </Stack>
            </CardOverflow>
            <CardContent>
                <Typography component="span" level="title-sm">
                    {name}
                </Typography>
                {url && (
                    <Stack sx={{ alignItems: "start", flexGrow: "1" }} spacing={2} direction="row">
                        <Typography level="body-md">/{url}</Typography>
                    </Stack>
                )}
            </CardContent>
        </Card>
    );
}
