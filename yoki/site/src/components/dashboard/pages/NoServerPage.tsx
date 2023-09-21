import { Alert, Box, Link, Stack, Typography } from "@mui/joy";
import { GuildedServer } from "../../../lib/@types/guilded";
import ServerDisplay from "../ServerDisplay";
import LabsButton from "../../LabsButton";
import PagePlaceholder, { PagePlaceholderIcon } from "../../PagePlaceholder";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

type Props = {
    currentServer: GuildedServer;
};

export default function NoServerPage({ currentServer }: Props) {
    return (
        <Stack alignItems="center" direction="row" className="grow shrink-0">
            <Stack alignItems="center" direction="column" gap={3} sx={{ flex: "1", mb: 20 }}>
                <PagePlaceholder
                    icon={PagePlaceholderIcon.NoPermission}
                    title="Uh oh! Yoki isn't in this server"
                    description="Yoki hasn't been in this server yet. Invite Yoki to protect the server and be able to manage it through this dashboard."
                />
                <ServerDisplay server={currentServer} />
                <LabsButton>Invite Yoki</LabsButton>
                <Alert color="primary" variant="soft" startDecorator={<FontAwesomeIcon icon={faInfoCircle} />} sx={{ mt: 8 }}>
                    <Box sx={{ alignItems: "baseline" }}>
                        <Typography fontSize="md" sx={{ color: "inherit" }}>
                            If you believe this is a bug, be sure to report it in{" "}
                            <Link color="primary" sx={{ textDecoration: "underline" }} href="https://www.guilded.gg/yoki">
                                Yoki Labs server
                            </Link>
                        </Typography>
                    </Box>
                </Alert>
            </Stack>
        </Stack>
    );
}
