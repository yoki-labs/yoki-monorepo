import { Box, Stack, Typography } from "@mui/joy";
import PagePlaceholder, { PagePlaceholderIcon } from "../PagePlaceholder";
import { AppealsSessionProps, BaseAppealsSessionProps, appealWaitingTime } from "../../utils/appealUtil";
import { ServerPayload } from "@guildedjs/api";
import LabsForm from "../LabsForm";
import { LabsFormFieldType } from "../form";
import { checkServerIdentity } from "tls";
import ms from "ms";

export default function AppealsPageDisplay(props: AppealsSessionProps) {
    const { code } = props;

    // Wrong ID or Yoki isn't in the server
    if (code === "NOT_FOUND")
        return (
            <AppealsPagePlaceholder
                icon={PagePlaceholderIcon.NotFound}
                title="Not found"
                description="This server either doesn't exist or does not have Yoki to have appeals."
                />
        );
    // Can't unban them; they aren't in the ban list of that Guilded server on Guilded
    else if (code === "NOT_BANNED")
        return (
            <AppealsPagePlaceholder
                icon={PagePlaceholderIcon.NotFound}
                title="Not banned"
                description="You haven't been banned yet and cannot appeal for an unban."
                />
        );
    // Can't unban them; they aren't in the ban list of that Guilded server on Guilded
    else if (code === "UNAVAILABLE")
        return (
            <AppealsPagePlaceholder
                icon={PagePlaceholderIcon.NoPermission}
                title="Appeals not enabled"
                description="This server does not have ban appeals enabled."
                />
        );
    // Can't unban them; they aren't in the ban list of that Guilded server on Guilded
    else if (code === "TOO_FAST") {
        const { elapsedTime } = props;
        const needToWait = appealWaitingTime - elapsedTime;

        return (
            <AppealsPagePlaceholder
                icon={PagePlaceholderIcon.NoPermission}
                title="Too fast"
                description={`You have recently appealed. You can come back in ${ms(needToWait, { long: true })}.`}
                />
        );
    }

    const { user, server } = props as (BaseAppealsSessionProps & { code: null, server: ServerPayload });

    return (
        <Stack direction="column" alignItems="center" sx={{ flex: "1", mt: 8 }}>
            <Typography level="h2">Server ban appeal form</Typography>
            <Typography level="body-md">This is the form for applying for an unban in {server.name}.</Typography>
            <Box sx={{ mt: 4, minWidth: 500 }}>
                <LabsForm
                    sections={[
                        {
                            fields: [
                                {
                                    prop: "reason",
                                    name: "Reason for an unban",
                                    type: LabsFormFieldType.TextArea,
                                    placeholder: "Type in text for a ban appeal here...",
                                    minRows: 8,
                                    min: 10,
                                    max: 1000,
                                }
                            ]
                        }
                    ]}
                    onSubmit={({ reason }) => sendAppeal(server.id, reason as string)}
                    submitText="Send appeal"
                    alwaysDisplayActions
                    />
            </Box>
        </Stack>
    );
}

async function sendAppeal(serverId: string, content: string) {
    return fetch(`/api/appeals/${serverId}`, {
        method: "POST",
        body: JSON.stringify({ content }),
        headers: { "content-type": "application/json" },
    });
}

function AppealsPagePlaceholder({ icon, title, description }: { icon: PagePlaceholderIcon, title: string, description: string }) {
    return (
        <Stack direction="row" alignItems="center" sx={{ flex: "1" }}>
            <Stack direction="column" alignItems="center" sx={{ flex: "1", mb: 40 }}>
                <PagePlaceholder
                    icon={icon}
                    title={title}
                    description={description}
                    />
            </Stack>
        </Stack>
    )
}