import { Avatar, Box, Chip, Stack, Typography } from "@mui/joy";
import { ReactNode } from "react";

type Props = {
    name: string;
    bot?: boolean;
    children: ReactNode | ReactNode[];
};

export default function GuildedMessage({ name, bot, children }: Props) {
    return (
        <Box className="py-2 px-4 md:py-4 md:px-8">
            <Stack direction="row">
                <Box className="hidden md:block mr-4">
                    <Avatar src="/icon.png" size="lg" />
                </Box>
                <Box sx={{ flex: "1" }}>
                    <Stack direction="row" alignItems="center" sx={{ mb: 1 }} className="gap-2 md:gap-4">
                        <Avatar src="/icon.png" size="sm" className="block md:hidden" />
                        <Typography component="span" level="title-md" fontWeight="bolder">
                            {name}
                        </Typography>
                        {bot && (
                            <Typography component="span" sx={{ px: 1 }} level="body-md" fontSize="xs" fontWeight="bolder" color="neutral" variant="solid">
                                BOT
                            </Typography>
                        )}
                        <Typography component="span" level="body-md" className="hidden md:block">
                            2:00 PM
                        </Typography>
                    </Stack>
                    <Stack direction="column" gap={1}>
                        {children}
                    </Stack>
                </Box>
            </Stack>
        </Box>
    );
}
