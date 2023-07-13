import { GuildedServer } from "../../../lib/@types/guilded/Server";
import { Box } from "@mui/joy";
import React from "react";
import { LayoutTopbar } from "./LayoutTopbar";
import { useRouter } from "next/router";

type LayoutProps = {
    servers: GuildedServer[];
    currentServer?: GuildedServer;
    user: Partial<{
        name: string | null;
        avatar: string | null;
    }>;
    topbarPrefix?: React.ReactNode | React.ReactNode[];
    children: React.ReactNode;
};

export default function LayoutWrapper(props: LayoutProps) {
    const { children, user, currentServer, servers, topbarPrefix } = props;

    const router = useRouter();

    const onServerChange = (serverId: string) => {
        router.push(`/dashboard/${serverId}/overview`);
    }

    return (
        <>
            <div className="flex flex-col h-full w-full bg-spacedark-950">
                <LayoutTopbar onServerChange={onServerChange} currentServer={currentServer} servers={servers} user={user}>
                    { topbarPrefix }
                </LayoutTopbar>
                <Box className="flex flex-row overflow-hidden">
                    { children }
                </Box>
            </div>
        </>
    );
}

// export default function Layout(props: { servers: GuildedServer[]; children: React.ReactNode }) {
//     // const [currentModule, setModule] = useAtom(navbarAtom);
//     const toast = useAtomValue(tempToastAtom);

// }
