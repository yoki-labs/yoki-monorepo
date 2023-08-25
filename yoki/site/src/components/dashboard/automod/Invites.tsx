import { faEnvelope, faLink } from "@fortawesome/free-solid-svg-icons";
import { Box } from "@mui/joy";
import React from "react";
import DashboardModule from "../DashboardModule";
import { DashboardPageProps } from "../pages";
import PagePlaceholder, { PagePlaceholderIcon } from "../../PagePlaceholder";

export default class InvitesPage extends React.Component<DashboardPageProps> {
    constructor(props: DashboardPageProps) {
        super(props);
    }

    render() {
        const { serverConfig } = this.props;

        return (
            <>
                <Box className="grid gap-4">
                    <DashboardModule
                        name="Invite Filter"
                        description="Filters out invites to other non-whitelisted servers in chat."
                        icon={faLink}
                        activeClassName="from-red-500 to-orange-500"
                        serverConfig={serverConfig}
                        prop="filterInvites"
                        iconAspectRatio={0.9}
                        hideBadges
                        largeHeader
                        />
                </Box>
                <PagePlaceholder icon={PagePlaceholderIcon.Wip} title="Work in progress" description="This section has not been done yet. Come back later!" />
            </>
        );
    }
}