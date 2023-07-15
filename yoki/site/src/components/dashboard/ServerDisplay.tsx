import { Avatar, Card, CardContent, CardOverflow, Stack, Typography } from "@mui/joy";
import { GuildedServer } from "../../lib/@types/guilded";
import { MouseEventHandler } from "react";
import { SxProps } from "@mui/joy/styles/types";

type Props = {
    server: GuildedServer;
    onClick?: MouseEventHandler<HTMLDivElement> | undefined;
    sx?: SxProps | undefined;
};

export default function ServerDisplay({ server, onClick, sx }: Props) {
    return (
        <Card sx={{ bgcolor: "background.level1", ...sx }} onClick={onClick} orientation="horizontal">
            <CardOverflow sx={{ pl: 2 }}>
                <Stack sx={{ height: "100%" }} direction="row" alignItems="center">
                    <Avatar src={server.profilePicture ?? void 0}>{server.name[0]}</Avatar>
                </Stack>
            </CardOverflow>
            <CardContent>
                <Typography component="span" level="h6">{server.name}</Typography>
                <Stack sx={{ alignItems: "start", flexGrow: "1" }} spacing={2} direction="row">
                    <Typography level="body2">/{server.subdomain}</Typography>
                    <Typography level="body3" color="neutral" variant="solid">{server.id}</Typography>
                </Stack>
            </CardContent>
        </Card>
    );
}