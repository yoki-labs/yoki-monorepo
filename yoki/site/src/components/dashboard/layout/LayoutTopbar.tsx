import { Box, Breadcrumbs, Typography } from "@mui/joy";
import { ServerSelector } from "./ServerSelector";
import { GuildedServer } from "../../../lib/@types/guilded";
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
        <Box sx={{ display: "flex", flexDirection: "row", gap: 2, alignItems: "center" }} className="px-5 py-4 md:px-10 md:py-8">
            {children}
            <Breadcrumbs
                sx={{ p: 0, "--Breadcrumbs-gap": "20px", display: "flex", alignItems: "center" }}
                className="grow"
                separator={
                    <Typography level="title-sm" textColor="text.secondary" className="hidden md:block">
                        /
                    </Typography>
                }
            >
                <Box>
                    <Branding />
                </Box>
                <Box className="hidden md:block">
                    <ServerSelector onChange={onServerChange} defaultValue={currentServer} servers={servers} />
                </Box>
            </Breadcrumbs>
            <UserManager user={user} />
        </Box>
    );
}
