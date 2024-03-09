import { Box, Breadcrumbs, Typography } from "@mui/joy";
// import { ServerSelector } from "./ServerSelector";
import { GuildedClientServer, GuildedServer } from "../../../lib/@types/guilded";
import UserManager from "../../UserManager";
import Branding from "../../Branding";
import { LabsSessionUser } from "../../../utils/routes/pages";
import { ServerSelector } from "./ServerSelector";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSlash } from "@fortawesome/free-solid-svg-icons";

type Props = {
    servers: GuildedClientServer[];
    currentServer?: GuildedServer;
    onServerChange: (serverId: string) => unknown | Promise<unknown>;
    user?: LabsSessionUser | null;
    breadcrumbs?: React.ReactNode | React.ReactNode[] | undefined;
    children?: React.ReactNode | React.ReactNode[];
};

export function LayoutTopbar({ breadcrumbs, children, onServerChange, currentServer, servers, user }: Props) {
    return (
        <Box sx={{ display: "flex", flexDirection: "row", gap: 2, alignItems: "center" }} className="px-5 py-4 md:px-10 md:py-8">
            {children}
            <Breadcrumbs
                sx={{ p: 0, "--Breadcrumbs-gap": "20px", display: "flex", alignItems: "center", userSelect: "none" }}
                className="grow"
                separator={
                    <Typography level="title-sm" textColor="text.secondary" className="hidden md:block" fontWeight="bolder">
                        {"/"}
                    </Typography>
                }
            >
                <Box key="layout-topbar.breadcrumb-branding">
                    <Branding />
                </Box>
                <Box key="layout-topbar.breadcrumb-server" className="hidden md:block">
                    <ServerSelector onChange={onServerChange} defaultValue={currentServer?.id} currentServer={currentServer} servers={servers} />
                </Box>
                {breadcrumbs}
            </Breadcrumbs>
            <UserManager user={user} />
        </Box>
    );
}
