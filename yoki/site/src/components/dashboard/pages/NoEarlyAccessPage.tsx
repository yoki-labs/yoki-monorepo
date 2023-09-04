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

export default function NoEarlyAccessPage({ currentServer }: Props) {
    return (
        <Stack alignItems="center" direction="row" className="grow shrink-0">
            <Stack alignItems="center" direction="column" gap={3} sx={{ flex: "1", mb: 20 }}>
                <PagePlaceholder
                    icon={PagePlaceholderIcon.NoPermission}
                    title="Not permitted"
                    description="Unfortunately, this server does not have early access to use this."
                />
                <ServerDisplay server={currentServer} />
                <Alert color="primary" variant="soft" startDecorator={<FontAwesomeIcon icon={faInfoCircle} />} sx={{ mt: 8 }}>
                    <Box sx={{ alignItems: "baseline" }}>
                        <Typography fontSize="md" sx={{ color: "inherit" }}>
                            We are still in the process of making dashboard and this will be available in the very near future!
                        </Typography>
                    </Box>
                </Alert>
            </Stack>
        </Stack>
    );
}