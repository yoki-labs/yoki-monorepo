import { Box } from "@mui/joy";
import React from "react";
import Module from "../Module";
import { DashboardPageProps } from "./page";
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
                    <Module
                        name="Anti-raid"
                        description="Customize how the bot detects and handles suspicious accounts."
                        icon={faShieldHalved}
                        activeClassName="from-green-500 to-blue-500"
                        isActive={serverConfig.antiRaidEnabled}
                        onToggle={(value) => console.log("Anti-raid toggle", value)}
                        hideBadges
                        iconAspectRatio={1}
                        />
                </Box>
                <PagePlaceholder icon={PagePlaceholderIcon.Wip} title="Work in progress" description="This section has not been done yet. Come back later!" />
            </>
        );
    }
}