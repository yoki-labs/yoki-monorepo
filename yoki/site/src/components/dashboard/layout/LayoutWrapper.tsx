import { GuildedClientServer, GuildedServer } from "../../../lib/@types/guilded";
import { Box, styled } from "@mui/joy";
import React from "react";
import { LayoutTopbar } from "./LayoutTopbar";
import { LabsSessionUser } from "../../../utils/routes/pages";

type LayoutProps = {
    servers: GuildedClientServer[];
    currentServer?: GuildedServer;
    user: LabsSessionUser;
    topbarPrefix?: React.ReactNode | React.ReactNode[];
    breadcrumbs?: React.ReactNode | React.ReactNode[] | undefined;
    children: React.ReactNode;
    onServerChange: (serverId: string) => void;
};

const LayoutWrapperBox = styled(`div`)(({ theme }) => ({
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.vars.palette.background.body,
}));

export default function LayoutWrapper(props: LayoutProps) {
    const { children, user, currentServer, servers, topbarPrefix, breadcrumbs, onServerChange } = props;

    return (
        <LayoutWrapperBox>
            <LayoutTopbar breadcrumbs={breadcrumbs} onServerChange={onServerChange} currentServer={currentServer} servers={servers} user={user}>
                {topbarPrefix}
            </LayoutTopbar>
            <Box className="flex flex-row grow overflow-hidden">{children}</Box>
        </LayoutWrapperBox>
    );
}

// export default function Layout(props: { servers: GuildedServer[]; children: React.ReactNode }) {
//     // const [currentModule, setModule] = useAtom(navbarAtom);
//     const toast = useAtomValue(tempToastAtom);

// }
