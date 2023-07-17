import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { Box } from "@mui/joy";
import React from "react";
import Module from "../Module";
import { DashboardPageProps } from "./page";
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
                    <Module
                        name="Modmail"
                        description="Customize how your users interact with your moderators."
                        icon={faEnvelope}
                        activeClassName="from-purple-500 to-blue-500"
                        isActive={serverConfig.modmailEnabled}
                        onToggle={(value) => console.log("Modmail toggle", value)}
                        hideBadges
                        iconAspectRatio={1}
                        />
                </Box>
                <PagePlaceholder icon={PagePlaceholderIcon.Wip} title="Work in progress" description="This section has not been done yet. Come back later!" />
            </>
        );
    }
}