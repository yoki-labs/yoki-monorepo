import { faImage, faLink } from "@fortawesome/free-solid-svg-icons";
import { Box } from "@mui/joy";
import React from "react";
import DashboardModule from "../DashboardModule";
import { DashboardPageProps } from "../pages";
import PagePlaceholder, { PagePlaceholderIcon } from "../../PagePlaceholder";
import { PremiumType } from "@prisma/client";

export default class ImagesPage extends React.Component<DashboardPageProps> {
    constructor(props: DashboardPageProps) {
        super(props);
    }

    render() {
        const { serverConfig } = this.props;

        return (
            <>
                <Box className="grid gap-4">
                    <DashboardModule
                        name="NSFW Image Scan"
                        description="Removes any potentially NSFW images from chat and media."
                        icon={faImage}
                        activeClassName="from-pink-500 to-purple-500"
                        serverConfig={serverConfig}
                        prop="scanNSFW"
                        requiresPremium={PremiumType.Silver}
                        disabled={!serverConfig.premium}
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
