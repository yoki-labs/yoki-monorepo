import { Avatar, Chip, Stack, Typography } from "@mui/joy";
import { GuildedSanitizedUserDetail } from "../lib/@types/guilded";
import { guildedAwsCdnDomain, guildedCdnDomain } from "../utils/userUtil";

type Props = {
    userId: string;
    user?: GuildedSanitizedUserDetail;
};

const botId = "mGMEZ8r4";

export function LabsUserCard({ userId, user }: Props) {
    const isYoki = userId === botId;

    return (
        <Stack direction="row" alignItems="center" gap={1}>
            <Avatar size="sm" src={isYoki ? "/icon.png" : user?.profilePicture?.replace(guildedAwsCdnDomain, guildedCdnDomain) ?? void 0} />
            <Typography fontWeight={600} textColor="text.primary">
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
