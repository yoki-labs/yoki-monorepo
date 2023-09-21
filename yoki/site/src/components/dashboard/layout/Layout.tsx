import { GuildedServer } from "../../../lib/@types/guilded";
import { LayoutSidebar } from "./LayoutSidebar";
import { Box, IconButton } from "@mui/joy";
import React from "react";
import LayoutWrapper from "./LayoutWrapper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { SanitizedServer } from "../../../lib/@types/db";

type LayoutProps = {
    servers: GuildedServer[];
    currentServer?: GuildedServer;
    serverConfig: SanitizedServer;
    user: Partial<{
        name: string | null;
        avatar: string | null;
    }>;
    page: string;
    children: React.ReactNode;
    onServerChange: (serverId: string) => void;
};
type LayoutState = {
    menuEnabled: boolean;
};

export default class Layout extends React.Component<LayoutProps, LayoutState> {
    constructor(props: LayoutProps) {
        super(props);

        this.state = { menuEnabled: false };
    }

    toggleMenu() {
        const { menuEnabled } = this.state;
        this.setState({ menuEnabled: !menuEnabled });
    }

    render() {
        const { page, children, currentServer, serverConfig, servers, user, onServerChange } = this.props;

        return (
            <LayoutWrapper
                servers={servers}
                user={user}
                currentServer={currentServer}
                topbarPrefix={
                    <div className="md:hidden block">
                        <IconButton onClick={this.toggleMenu.bind(this)} color="neutral">
                            <FontAwesomeIcon icon={faBars} />
                        </IconButton>
                    </div>
                }
                onServerChange={onServerChange}
            >
                <LayoutSidebar
                    menuToggled={this.state.menuEnabled}
                    serverConfig={serverConfig}
                    servers={servers}
                    currentServer={currentServer}
                    onServerChange={onServerChange}
                    page={page}
                />
                <Box className={`overflow-hidden grow basis-0 shrink-0 flex ${this.state.menuEnabled ? "md:block hidden" : ""}`}>{children}</Box>
            </LayoutWrapper>
        );
    }
}
