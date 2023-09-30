import { Box } from "@mui/joy";
import React from "react";
import DashboardModule from "../DashboardModule";
import { DashboardPageProps } from "../pages";
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
                    <DashboardModule
                        name="Appeals"
                        description="Allows people to apply for an unban in your server."
                        icon={faPrayingHands}
                        activeClassName="from-violet-500 to-cyan-500"
                        serverConfig={serverConfig}
                        prop="appealsEnabled"
                        iconAspectRatio={0.8}
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
