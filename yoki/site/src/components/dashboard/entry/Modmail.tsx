import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { Box } from "@mui/joy";
import React from "react";
import DashboardModule from "../DashboardModule";
import { DashboardPageProps } from "../pages";
import PagePlaceholder, { PagePlaceholderIcon } from "../../PagePlaceholder";

export default class ModmailPage extends React.Component<DashboardPageProps> {
    constructor(props: DashboardPageProps) {
        super(props);
    }

    render() {
        const { serverConfig } = this.props;

        return (
            <>
                <Box className="grid gap-4">
                    <DashboardModule
                        name="Modmail"
                        description="Customize how your users interact with your moderators."
                        icon={faEnvelope}
                        activeClassName="from-purple-500 to-blue-500"
                        serverConfig={serverConfig}
                        prop="modmailEnabled"
                        iconAspectRatio={0.8}
                        hideBadges
                        largeHeader
                    />
                </Box>
                <PagePlaceholder icon={PagePlaceholderIcon.Wip} title="Work in progress" description="This section has not been done yet. Come back later!" />
            </>
        );
    }
}
