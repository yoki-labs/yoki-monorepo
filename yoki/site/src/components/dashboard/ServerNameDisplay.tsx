import { AspectRatio, Avatar, Box, Card, CardContent, CardOverflow, Stack, Typography } from "@mui/joy";
import { GuildedClientServer, GuildedServer } from "../../lib/@types/guilded";
import { MouseEventHandler } from "react";
import { SxProps } from "@mui/joy/styles/types";
import { guildedAwsCdnDomain, guildedCdnDomain } from "../../utils/userUtil";
import FakeImage from "../stylistic/FakeImage";

type Props = {
    id: string;
    name: string;
    avatar?: string | null;
    url?: string | null;
    // banner?: string | null;
    // onClick?: MouseEventHandler<HTMLDivElement> | undefined;
    sx?: SxProps | undefined;
};

export default function ServerNameDisplay({ id, name, avatar, url, sx }: Props) {
    return (
        <Stack direction="row" gap={2} alignItems="center" sx={sx}>
            <Box>
                <Avatar size="lg" src={avatar?.replace(guildedAwsCdnDomain, guildedCdnDomain)} />
            </Box>
            <Stack direction="column">
                <Typography level="h3">{name}</Typography>
                <Typography level="body-md" fontWeight="bold">/{url}</Typography>
            </Stack>
        </Stack>
        // <Card className="hoverAbove" sx={{ bgcolor: "background.level1", minWidth: 200, ...sx }} onClick={onClick}>
        //     <CardContent>
        //         <Stack gap={2} direction="row">
        //             <Avatar size="lg" src={avatar?.replace(guildedAwsCdnDomain, guildedCdnDomain) ?? void 0} sx={{ bgcolor: "neutral.700" }}>
        //                 {name[0].toUpperCase()}
        //             </Avatar>
        //             {url ? (
        //                 <Stack direction="column">
        //                     <Typography component="span" level="title-sm">
        //                         {name}
        //                     </Typography>
        //                     <Stack sx={{ mt: 0.25, alignItems: "start", flexGrow: "1" }} spacing={2} direction="row">
        //                         <Typography level="body-md">/{url}</Typography>
        //                     </Stack>
        //                 </Stack>
        //             ) : (
        //                 <Stack direction="row" alignItems="center">
        //                     <Typography component="span" level="title-sm">
        //                         {name}
        //                     </Typography>
        //                 </Stack>
        //             )}
        //         </Stack>
        //     </CardContent>
        // </Card>
    );
}
