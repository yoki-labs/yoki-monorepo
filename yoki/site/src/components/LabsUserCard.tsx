import { Avatar, Chip, Stack, Typography } from "@mui/joy";
import { GuildedSanitizedUserDetail } from "../lib/@types/guilded";

type Props = {
    userId: string;
    user?: GuildedSanitizedUserDetail;
};

const botId = "mGMEZ8r4";
const awsCdnUrl = "s3-us-west-2.amazonaws.com/www.guilded.gg";
const guildedCdnUrl = "cdn.gilcdn.com";

export function LabsUserCard({ userId, user }: Props) {
    const isYoki = userId === botId;

    return (
        <Stack direction="row" alignItems="center" gap={1}>
            <Avatar size="sm" src={isYoki ? "/icon.png" : user?.profilePicture?.replace(awsCdnUrl, guildedCdnUrl) ?? void 0} />
            <Typography fontWeight="bolder" textColor="text.primary">
                {isYoki ? "Yoki" : user?.name ?? userId}
            </Typography>
            {(isYoki || user?.type === "bot") && (
                <Chip variant="soft" color="primary" size="sm">
                    Automod
                </Chip>
            )}
        </Stack>
    );
}
