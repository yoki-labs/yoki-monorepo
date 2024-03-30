import { Alert, Box, Button, Link, Stack, Typography } from "@mui/joy";
import { GuildedServer } from "../../../lib/@types/guilded";
import ServerDisplay from "../ServerDisplay";
import LabsButton from "../../LabsButton";
import PagePlaceholder, { PagePlaceholderIcon } from "../../PagePlaceholder";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import ServerNameDisplay from "../ServerNameDisplay";

type Props = {
    currentServer: GuildedServer;
};

export default function NoServerPage({ currentServer }: Props) {
    return (
        <Box className="flex grow shrink-0" sx={{ width: "100%", pt: 10 }}>
            <Stack className="px-5" alignItems="center" direction="column" gap={3} sx={{ flex: "1", mb: 20 }}>
                <PagePlaceholder icon={PagePlaceholderIcon.NoPermission} title="Uh oh! Yoki isn't in this server">
                    Yoki hasn't been in this server yet. Invite Yoki to protect the server and be able to manage it through this dashboard.
                </PagePlaceholder>
                <ServerNameDisplay id={currentServer.id} name={currentServer.name} avatar={currentServer.avatar} url={currentServer.url} sx={{ mt: 1, mb: 1.5 }} />
                {/* <ServerDisplay id={currentServer.id} name={currentServer.name} avatar={currentServer.avatar} banner={currentServer.banner} url={currentServer.url} /> */}
                <Stack gap={2} direction="row">
                    <LabsButton>Invite Yoki</LabsButton>
                    <Button variant="outlined" color="primary">Go back</Button>
                </Stack>
                <Alert color="primary" variant="soft" startDecorator={<FontAwesomeIcon icon={faInfoCircle} />} sx={{ mt: 12 }}>
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
        </Box>
    );
}
