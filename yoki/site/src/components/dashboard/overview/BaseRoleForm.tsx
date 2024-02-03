import { SanitizedServer } from "../../../lib/@types/db";
import { errorifyResponseError, notifyFetchError } from "../../../utils/errorUtil";
import LabsForm from "../../form/LabsForm";
import { LabsFormFieldOption, LabsFormFieldType } from "../../form/form";

async function onBaseRoleChanges(serverId: string, muteRoleId: number | undefined | null, memberRoleId: number | undefined | null, modmailPingRoleId: number | undefined | null) {
    return fetch(`/api/servers/${serverId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ muteRoleId, memberRoleId, modmailPingRoleId }),
    })
        .then(errorifyResponseError)
        .catch(notifyFetchError.bind(null, "Error while updating server data for role changes"));
}

export default function BaseRolesForm({ serverConfig, serverRoleOptions }: { serverConfig: SanitizedServer; serverRoleOptions: LabsFormFieldOption<number>[] }) {
    return (
        <LabsForm
            id="base-role-form"
            onSubmit={({ muteRoleId, memberRoleId, modmailPingRoleId }) =>
                onBaseRoleChanges(
                    serverConfig.serverId,
                    muteRoleId as number | null | undefined,
                    memberRoleId as number | null | undefined,
                    modmailPingRoleId as number | null | undefined
                )
            }
            sections={[
                {
                    fields: [
                        {
                            type: LabsFormFieldType.Select,
                            prop: "muteRoleId",
                            name: "Mute role",
                            description: "The role that will be assigned when user gets muted.",
                            defaultValue: serverConfig.muteRoleId,
                            selectableValues: serverRoleOptions,
                            placeholder: "Select mute role",
                        },
                        {
                            type: LabsFormFieldType.Select,
                            prop: "memberRoleId",
                            name: "Member role",
                            description: "The role that will be assigned when user's accounts get verified as non-bot by Yoki.",
                            defaultValue: serverConfig.memberRoleId,
                            selectableValues: serverRoleOptions,
                            placeholder: "Select member role",
                        },
                        {
                            type: LabsFormFieldType.Select,
                            prop: "modmailPingRoleId",
                            name: "Modmail support role",
                            description: "The role that will be mentioned privately and silently when a new modmail ticket is created by a user.",
                            defaultValue: serverConfig.modmailPingRoleId,
                            selectableValues: serverRoleOptions,
                            placeholder: "Select modmail role",
                        },
                    ],
                },
            ]}
            resetOnSubmission
        />
    );
}
