import { Avatar, Box, Chip, Stack, Typography } from "@mui/joy";
import { ReactNode } from "react";

type Props = {
    name: string;
    bot?: boolean;
    children: ReactNode | ReactNode[];
};

export default function GuildedMessage({ name, bot, children }: Props) {
    return (
        <Box sx={{ py: 2, px: 4 }}>
            <Stack direction="row">
                <Box sx={{ mr: 2 }}>
                    <Avatar src="/icon.png" size="lg" />
                </Box>
                <Box sx={{ flex: "1" }}>
                    <Stack gap={2} direction="row" alignItems="center" sx={{ mb: 1 }}>
                        <Typography component="span" level="title-md" fontWeight="bolder">{ name }</Typography>
                        { bot && <Typography component="span" sx={{ px: 1 }} level="body-md" fontSize="sm" fontWeight="bolder" color="neutral" variant="solid">BOT</Typography> }
                        <Typography component="span" level="body-md">2:00 PM</Typography>
                    </Stack>
                    <Stack direction="column" gap={1}>
                        { children }
                    </Stack>
                </Box>
            </Stack>
        </Box>
    );
}