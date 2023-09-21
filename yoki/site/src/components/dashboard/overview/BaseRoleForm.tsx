import { SanitizedServer } from "../../../lib/@types/db";
import { notifyFetchError } from "../../../utils/errorUtil";
import LabsForm from "../../LabsForm";
import { LabsFormFieldOption, LabsFormFieldType } from "../../form";

async function onBaseRoleChanges(serverId: string, muteRoleId: number | undefined | null, memberRoleId: number | undefined | null) {
    return fetch(`/api/servers/${serverId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ muteRoleId, memberRoleId }),
    }).catch(notifyFetchError.bind(null, "Error while updating server data for role changes"));
}

export default function BaseRolesForm({ serverConfig, serverRoleOptions }: { serverConfig: SanitizedServer; serverRoleOptions: LabsFormFieldOption<number>[] }) {
    return (
        <LabsForm
            onSubmit={({ muteRoleId, memberRoleId }) =>
                onBaseRoleChanges(serverConfig.serverId, muteRoleId as number | null | undefined, memberRoleId as number | null | undefined)
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
                    ],
                },
            ]}
        />
    );
}
