import { Avatar, Chip, Stack, Typography } from "@mui/joy";

type Props = {
    userId: string;
};

const botId = "mGMEZ8r4";

export function LabsUserCard({ userId }: Props) {
    const isYoki = userId === botId;

    return (
        <Stack direction="row" alignItems="center" gap={1}>
            <Avatar size="sm" src={isYoki ? "/icon.png" : undefined} />
            <Typography fontWeight="bolder" textColor="text.secondary">
                {isYoki ? "Yoki" : userId}
            </Typography>
            { isYoki && <Chip variant="outlined" color="primary" size="sm">Automod</Chip> }
        </Stack>
    )
}