import { faBan } from "@fortawesome/free-solid-svg-icons";
import { Box } from "@mui/joy";
import React from "react";
import DashboardModule from "../DashboardModule";
import { DashboardPageProps } from "../pages";
import PagePlaceholder, { PagePlaceholderIcon } from "../../PagePlaceholder";

export default class SpamPage extends React.Component<DashboardPageProps> {
    constructor(props: DashboardPageProps) {
        super(props);
    }

    render() {
        const { serverConfig } = this.props;

        return (
            <>
                <Box className="grid gap-4">
                <DashboardModule
                    name="Filter Spam"
                    description="Filters out spam, as well as blacklisted phrases or links."
                    icon={faBan}
                    activeClassName="from-red-500 to-pink-500"
                    isActive={serverConfig.filterEnabled}
                    onToggle={(value) => console.log("Auto-mod toggle", value)}
                    iconAspectRatio={1}
                    hideBadges
                    largeHeader
                    />
                </Box>
                <PagePlaceholder icon={PagePlaceholderIcon.Wip} title="Work in progress" description="This section has not been done yet. Come back later!" />
            </>
        );
    }
}