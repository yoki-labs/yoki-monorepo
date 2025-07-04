import { GuildedClientServer, GuildedSanitizedUserDetail, GuildedServer, GuildedUserDetail } from "../../lib/@types/guilded";

export const sanitizeUserDetails = (userDetails: Record<string, GuildedUserDetail>): Record<string, GuildedSanitizedUserDetail> => {
    const newDetails: Record<string, GuildedSanitizedUserDetail> = {};
    const userIdList = Object.keys(userDetails);

    for (const userId of userIdList) newDetails[userId] = sanitizeSingleUserDetail(userDetails[userId]);

    return newDetails;
};

const sanitizeSingleUserDetail = ({ id, name, nickname, subdomain, profilePicture, aboutInfo, type }: GuildedUserDetail): GuildedSanitizedUserDetail => ({
    id,
    name,
    nickname,
    subdomain,
    profilePicture,
    aboutInfo,
    type,
});

export const transformToApiServer = ({ id, name, subdomain, profilePicture, homeBannerImageMd }: GuildedClientServer): GuildedServer => ({
    id,
    name,
    url: subdomain,
    avatar: profilePicture ?? undefined,
    banner: homeBannerImageMd ?? undefined,
});
