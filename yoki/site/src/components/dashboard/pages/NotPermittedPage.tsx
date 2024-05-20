import { Alert, Box, Button, Link, Stack, Typography } from "@mui/joy";
import { GuildedServer } from "../../../lib/@types/guilded";
import ServerDisplay from "../ServerDisplay";
import PagePlaceholder, { PagePlaceholderIcon } from "../../PagePlaceholder";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import ServerNameDisplay from "../ServerNameDisplay";

type Props = {
    currentServer: GuildedServer;
};

export default function NotPermittedPage({ currentServer }: Props) {
    return (
        <Stack alignItems="center" direction="row" className="grow shrink-0" sx={{ width: "100%" }}>
            <Stack className="px-5" alignItems="center" direction="column" gap={3} sx={{ flex: "1", mb: 20 }}>
                <PagePlaceholder icon={PagePlaceholderIcon.NoPermission} title="Not permitted">
                    Unfortunately, you do not have a role that is configured as staff role or you are not the owner of this server.
                </PagePlaceholder>
                <ServerNameDisplay id={currentServer.id} name={currentServer.name} avatar={currentServer.avatar} url={currentServer.url} sx={{ mt: 1, mb: 1.5 }} />
                <Button variant="outlined" color="primary">
                    Go back
                </Button>
                <Alert color="primary" variant="soft" startDecorator={<FontAwesomeIcon icon={faInfoCircle} />} sx={{ mt: 8 }}>
                    <Box sx={{ alignItems: "baseline" }}>
                        <Typography fontSize="md" sx={{ color: "inherit" }}>
                            Make sure you have one of the roles set as ADMIN in Yoki and have them assigned to you. If you believe this is a bug, be sure to report it in{" "}
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
