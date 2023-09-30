import { Box } from "@mui/joy";
import React from "react";
import DashboardModule from "../DashboardModule";
import { DashboardPageProps } from "../pages";
import { faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import PagePlaceholder, { PagePlaceholderIcon } from "../../PagePlaceholder";

export default class AntiraidPage extends React.Component<DashboardPageProps> {
    constructor(props: DashboardPageProps) {
        super(props);
    }

    render() {
        const { serverConfig } = this.props;

        return (
            <>
                <Box className="grid gap-4">
                    <DashboardModule
                        name="Anti-raid"
                        description="Customize how the bot detects and handles suspicious accounts."
                        icon={faShieldHalved}
                        activeClassName="from-green-500 to-blue-500"
                        serverConfig={serverConfig}
                        prop="antiRaidEnabled"
                        hideBadges
                        largeHeader
                    />
                </Box>
                <PagePlaceholder icon={PagePlaceholderIcon.Wip} title="Work in progress">
                    This section has not been done yet. Come back later!
                </PagePlaceholder>
            </>
        );
    }
}
