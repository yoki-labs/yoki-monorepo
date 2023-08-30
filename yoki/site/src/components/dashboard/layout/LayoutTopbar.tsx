import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar, Box, Breadcrumbs, IconButton, Typography } from "@mui/joy";
import YokiIcon from "../../YokiIcon";
import { ServerSelector } from "./ServerSelector";
import { GuildedServer } from "../../../lib/@types/guilded";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import UserManager from "./UserManager";
import Branding from "../../Branding";

type Props = {
    servers: GuildedServer[];
    currentServer?: GuildedServer;
    onServerChange: (serverId: string) => unknown | Promise<unknown>;
    user: Partial<{
        name: string | null;
        avatar: string | null;
    }>;
    children?: React.ReactNode | React.ReactNode[];
};

export function LayoutTopbar({ children, onServerChange, currentServer, servers, user }: Props) {
    return (
        <Box sx={{ display: "flex", flexDirection: "row", py: 3.5, px: 5, gap: 2 }}>
            { children }
            <Breadcrumbs
                sx={{ p: 0, "--Breadcrumbs-gap": "20px" }}
                className="grow"
                separator={
                    <Typography level="title-sm" textColor="text.secondary">
                        /
                    </Typography>
                }
            >
                <Box>
                    <Branding />
                </Box>
                <ServerSelector onChange={onServerChange} defaultValue={currentServer} servers={servers} />
            </Breadcrumbs>
            <UserManager user={user} />
        </Box>
    );
}