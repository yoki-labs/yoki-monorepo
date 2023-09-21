import { GuildedServer } from "../../../lib/@types/guilded";
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
    onServerChange: (serverId: string) => void;
};

export default function LayoutWrapper(props: LayoutProps) {
    const { children, user, currentServer, servers, topbarPrefix, onServerChange } = props;

    return (
        <>
            <div className="flex flex-col h-full w-full bg-spacedark-950">
                <LayoutTopbar onServerChange={onServerChange} currentServer={currentServer} servers={servers} user={user}>
                    {topbarPrefix}
                </LayoutTopbar>
                <Box className="flex flex-row grow overflow-hidden">{children}</Box>
            </div>
        </>
    );
}

// export default function Layout(props: { servers: GuildedServer[]; children: React.ReactNode }) {
//     // const [currentModule, setModule] = useAtom(navbarAtom);
//     const toast = useAtomValue(tempToastAtom);

// }
