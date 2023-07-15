import { Stack, Typography } from "@mui/joy";
import { GuildedServer } from "../../../lib/@types/guilded";
import ServerDisplay from "../ServerDisplay";
import LabsButton from "../../LabsButton";

type Props = {
    currentServer: GuildedServer;
};

export default function NoServerPage({ currentServer }: Props) {
    return (
        <Stack alignItems="center" className="grow shrink-0">
            <Typography className="mb-4" level="h3">Uh oh! Yoki isn't in this server</Typography>
            <ServerDisplay server={currentServer} />
            <Typography className="mt-8 mb-2" level="body2">Try inviting Yoki to the server to manage it.</Typography>
            <LabsButton>Invite Yoki</LabsButton>
        </Stack>
    );
}