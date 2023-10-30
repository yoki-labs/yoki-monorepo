import { Avatar, Stack, Typography } from "@mui/joy";

type Props = {
    serverId: string;
};

export function LabsServerCard({ serverId }: Props) {
    return (
        <Stack direction="row" alignItems="center" gap={1}>
            <Avatar size="sm">?</Avatar>
            <Typography fontWeight="bolder" textColor="text.secondary">
                {serverId}
            </Typography>
        </Stack>
    );
}
