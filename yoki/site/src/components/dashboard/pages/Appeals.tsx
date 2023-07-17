import { Box } from "@mui/joy";
import React from "react";
import Module from "../Module";
import { DashboardPageProps } from "./page";
import { faPrayingHands } from "@fortawesome/free-solid-svg-icons";
import PagePlaceholder, { PagePlaceholderIcon } from "../../PagePlaceholder";

export default class AppealsPage extends React.Component<DashboardPageProps> {
    constructor(props: DashboardPageProps) {
        super(props);
    }

    render() {
        const { serverConfig } = this.props;

        return (
            <>
                <Box className="grid gap-4">
                    <Module
                        name="Appeals"
                        description="Allows people to apply for an unban in your server."
                        icon={faPrayingHands}
                        activeClassName="from-violet-500 to-cyan-500"
                        isActive={serverConfig.appealsEnabled}
                        onToggle={(value) => console.log("Appeals toggle", value)}
                        hideBadges
                        iconAspectRatio={1}
                        />
                </Box>
                <PagePlaceholder icon={PagePlaceholderIcon.Wip} title="Work in progress" description="This section has not been done yet. Come back later!" />
            </>
        );
    }
}