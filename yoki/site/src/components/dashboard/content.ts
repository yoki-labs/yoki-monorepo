import { RolePayload } from "@guildedjs/api";
import { GuildedSanitizedUserDetail } from "../../lib/@types/guilded";
import { LabsFormFieldOption } from "../form/form";

export const optionifyRoles = (serverRoles: RolePayload[]) =>
    serverRoles
        .sort((a, b) => b.position - a.position)
        .map((serverRole) => ({
            name: serverRole.name,
            value: serverRole.id,
            avatarIcon: serverRole.icon,
            color: serverRole.colors?.[0],
        }));
export const optionifyUserDetails = (users: GuildedSanitizedUserDetail[]) =>
    users
        .map((x) => ({
            value: x.id,
            name: x.nickname ?? x.name,
            description: x.subdomain && `/${x.subdomain}`,
            avatarIcon: x.profilePicture,
        }));
export const nullUserOption: LabsFormFieldOption<null> = {
    value: null,
    name: "No one",
    description: "Remove filter",
    avatarIcon: null,
};
export const nullUserOptionList = [nullUserOption];