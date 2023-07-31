import { Box } from "@mui/joy";
import React from "react";
import DashboardModule from "../DashboardModule";
import { DashboardPageProps } from "../pages";
import { faBan, faLinkSlash } from "@fortawesome/free-solid-svg-icons";
import PagePlaceholder, { PagePlaceholderIcon } from "../../PagePlaceholder";

export default class LinksPage extends React.Component<DashboardPageProps> {
    constructor(props: DashboardPageProps) {
        super(props);
    }

    render() {
        const { serverConfig } = this.props;

        return (
            <>
                <Box className="grid sm:grid-cols-1 md:grid-cols-2 gap-5">
                    <DashboardModule
                        name="Invite Filter"
                        description="Filters out invites in chat."
                        icon={faLinkSlash}
                        activeClassName="from-red-500 to-orange-500"
                        isActive={serverConfig.filterInvites}
                        onToggle={(value) => console.log("Automod toggle NSFW Image scan", value)}
                        iconAspectRatio={1}
                        hideBadges
                        largeHeader
                    />
                    <DashboardModule
                        name="Auto-mod"
                        description="Filters out spam and blacklisted phrases or links."
                        icon={faBan}
                        activeClassName="from-red-500 to-pink-500"
                        isActive={serverConfig.filterInvites}
                        onToggle={(value) => console.log("Automod toggle NSFW Image scan", value)}
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