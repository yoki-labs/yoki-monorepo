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
                <div className="hidden md:block mr-4">
                    <Avatar src="/icon.png" size="lg" />
                </div>
                <Box sx={{ flex: "1" }}>
                    <Stack direction="row" alignItems="center" sx={{ mb: 1 }} className="gap-2 md:gap-4">
                        <span className="block md:hidden">
                            <Avatar src="/icon.png" size="sm" />
                        </span>
                        <Typography component="span" level="title-md" fontWeight="bolder">
                            {name}
                        </Typography>
                        {bot && (
                            <Typography component="span" sx={{ px: 1 }} level="body-md" fontSize="xs" fontWeight="bolder" color="neutral" variant="solid">
                                BOT
                            </Typography>
                        )}
                        <span className="hidden md:block">
                            <Typography component="span" level="body-md">
                                2:00 PM
                            </Typography>
                        </span>
                    </Stack>
                    <Stack direction="column" gap={1}>
                        {children}
                    </Stack>
                </Box>
            </Stack>
        </Box>
    );
}
