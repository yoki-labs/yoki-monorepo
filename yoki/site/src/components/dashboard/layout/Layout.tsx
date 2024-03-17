import { GuildedClientServer, GuildedServer } from "../../../lib/@types/guilded";
import { LayoutSidebar } from "./LayoutSidebar";
import { Box, IconButton, Typography } from "@mui/joy";
import React from "react";
import LayoutWrapper from "./LayoutWrapper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { SanitizedServer } from "../../../lib/@types/db";
import { LabsSessionUser } from "../../../utils/routes/pages";
import { RoleType } from "@prisma/client";
import { DashboardPageItem } from "../pages";

type LayoutProps = {
    servers: GuildedClientServer[];
    currentServer?: GuildedServer;
    serverConfig: SanitizedServer;
    highestRoleType: RoleType;
    user: LabsSessionUser;
    page: string[];
    currentPage: DashboardPageItem | undefined;
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
        return this.setMenuToggled(!menuEnabled);
    }
    
    setMenuToggled(menuEnabled: boolean) {
        return this.setState({ menuEnabled });
    }

    render() {
        const { page, children, currentPage, currentServer, serverConfig, servers, user, highestRoleType, onServerChange } = this.props;

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
                breadcrumbs={
                    currentPage &&
                    <Box>
                        <Typography level="title-lg" fontWeight={500} textColor="text.secondary" startDecorator={<FontAwesomeIcon icon={currentPage.icon} />}>
                            {currentPage.name}
                        </Typography>
                    </Box>
                }
                onServerChange={onServerChange}
            >
                <LayoutSidebar
                    menuToggled={this.state.menuEnabled}
                    serverConfig={serverConfig}
                    highestRoleType={highestRoleType}
                    servers={servers}
                    currentServer={currentServer}
                    onServerChange={onServerChange}
                    page={page[0]}
                />
                <Box className={`overflow-hidden grow basis-0 shrink-0 flex ${this.state.menuEnabled ? "md:block hidden" : ""}`}>{children}</Box>
            </LayoutWrapper>
        );
    }
}
