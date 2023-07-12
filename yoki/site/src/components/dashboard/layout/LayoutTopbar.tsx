import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar, Box, Breadcrumbs, IconButton, Typography } from "@mui/joy";
import YokiIcon from "../../YokiIcon";
import { ServerSelector } from "./ServerSelector";
import { GuildedServer } from "../../../lib/@types/guilded/Server";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import UserManager from "./UserManager";

type Props = {
    servers: GuildedServer[];
    user: Partial<{
        name: string | null;
        avatar: string | null;
    }>;
    onMenuToggle: () => unknown;
};

export function LayoutTopbar({ servers, user, onMenuToggle }: Props) {
    return (
        <Box sx={{ display: "flex", flexDirection: "row", p: 3, gap: 2 }}>
            <IconButton className="md:hidden block" onClick={onMenuToggle} color="neutral">
                <FontAwesomeIcon icon={faBars}/>
            </IconButton>
            <Breadcrumbs
                sx={{ p: 0, "--Breadcrumbs-gap": "20px" }}
                className="grow"
                separator={
                    <Typography level="h6" textColor="text.secondary">
                        /
                    </Typography>
                }
            >
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Typography
                        startDecorator={<YokiIcon className="fill-spacelight-700" width="32px" height="32px" />}
                        level="h6"
                        textColor="text.secondary"
                        component="div"
                    >
                        Yoki
                    </Typography>
                </Box>
                <ServerSelector servers={servers} />
            </Breadcrumbs>
            <UserManager user={user} />
        </Box>
    );
}