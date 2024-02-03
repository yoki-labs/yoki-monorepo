import { faAnglesDown, faBan, faImage, faLink } from "@fortawesome/free-solid-svg-icons";
import { Box, Card, CardContent, Skeleton, Stack, Typography } from "@mui/joy";
import React from "react";
import DashboardModule from "../DashboardModule";
import { DashboardPageProps } from "../pages";
import AutomodPreset from "./AutomodPreset";
import { SanitizedPreset } from "../../../lib/@types/db";
import { notifyFetchError } from "../../../utils/errorUtil";
import { PremiumType, RoleType } from "@prisma/client";

type State = {
    isLoaded: boolean;
    isMounted: boolean;
    presets: SanitizedPreset[];
};

export default class AutomodPage extends React.Component<DashboardPageProps, State> {
    constructor(props: DashboardPageProps) {
        super(props);

        this.state = { isLoaded: false, isMounted: false, presets: [] };
    }

    async componentDidMount(): Promise<void> {
        const {
            serverConfig: { serverId },
        } = this.props;

        if (this.state.isMounted) return;

        this.setState({ isMounted: false });

        await fetch(`/api/servers/${serverId}/presets`, {
            method: "GET",
            headers: { "content-type": "application/json" },
        })
            .then((response) => {
                if (!response.ok) throw response;
                return response.json();
            })
            .then(({ presets }) => this.setState({ isLoaded: true, presets }))
            .catch(async (errorResponse) => this.onPresetFetchError(errorResponse));
    }

    async onPresetFetchError(errorResponse: Response) {
        this.setState({ isLoaded: true, presets: [] });

        return notifyFetchError("Error while fetching preset data", errorResponse);
    }

    render() {
        const { serverConfig, highestRoleType } = this.props;
        const { isLoaded, presets } = this.state;

        return (
            <>
                <Typography level="h4" gutterBottom>
                    Auto-moderation
                </Typography>
                <Box className="grid grid-cols-1 lg:grid-cols-2 xlg:grid-cols-3 gap-4">
                    <DashboardModule
                        name="NSFW Image Scan"
                        description="Removes any potentially NSFW images from chat and media."
                        icon={faImage}
                        activeClassName="from-pink-500 to-purple-500"
                        serverConfig={serverConfig}
                        disabled={!serverConfig.premium || highestRoleType !== RoleType.ADMIN}
                        prop="scanNSFW"
                        requiresPremium={PremiumType.Silver}
                    />
                    <DashboardModule
                        name="Automod"
                        description="Filters out spam and blacklisted phrases, words or links."
                        icon={faBan}
                        activeClassName="from-red-500 to-pink-500"
                        serverConfig={serverConfig}
                        disabled={highestRoleType !== RoleType.ADMIN}
                        prop="filterEnabled"
                    />
                    <DashboardModule
                        name="Invite Filter"
                        description="Filters out invites to other non-whitelisted servers in chat."
                        icon={faLink}
                        activeClassName="from-red-500 to-orange-500"
                        serverConfig={serverConfig}
                        disabled={highestRoleType !== RoleType.ADMIN}
                        prop="filterInvites"
                    />
                    <DashboardModule
                        name="Anti-hoist"
                        description="Prevents people from purposefully putting themselves from above everyone."
                        icon={faAnglesDown}
                        activeClassName="from-orange-500 to-yellow-500"
                        serverConfig={serverConfig}
                        disabled={highestRoleType !== RoleType.ADMIN}
                        prop="antiHoistEnabled"
                    />
                </Box>
                <Box>
                    <Typography level="title-md" gutterBottom>
                        Presets
                    </Typography>
                    <Box className="grid sm:grid-cols-1 md:grid-cols-2 xlg:grid-cols-3 gap-4 overflow-x-hidden">
                        {isLoaded ? (
                            <>
                                <AutomodPreset
                                    serverId={serverConfig.serverId}
                                    presetName="profanity"
                                    title="Profanity"
                                    description="Basic swear words such as 'shit' and 'bitch'."
                                    preset={presets.find((x) => x.preset === "profanity")}
                                    disabled={highestRoleType !== RoleType.ADMIN}
                                />
                                <AutomodPreset
                                    serverId={serverConfig.serverId}
                                    presetName="slurs"
                                    title="Slurs"
                                    description="Racial and slurs targetted towards groups of individuals."
                                    preset={presets.find((x) => x.preset === "slurs")}
                                    disabled={highestRoleType !== RoleType.ADMIN}
                                />
                                <AutomodPreset
                                    serverId={serverConfig.serverId}
                                    presetName="sexual"
                                    title="Sexual"
                                    description="Words relating to sexual activity or objects."
                                    preset={presets.find((x) => x.preset === "sexual")}
                                    disabled={highestRoleType !== RoleType.ADMIN}
                                />
                                <AutomodPreset
                                    serverId={serverConfig.serverId}
                                    presetName="sexual-links"
                                    title="Sexual Links"
                                    description="Link of websites relating to sexual activity."
                                    preset={presets.find((x) => x.preset === "sexual-links")}
                                    disabled={highestRoleType !== RoleType.ADMIN}
                                />
                            </>
                        ) : (
                            <>
                                <PresetSkeleton />
                                <PresetSkeleton />
                                <PresetSkeleton />
                                <PresetSkeleton />
                            </>
                        )}
                    </Box>
                </Box>
                {/* <Box>
                    <Typography level="title-md" gutterBottom>
                        Auto-mod Ignoring
                    </Typography>
                    <PagePlaceholder icon={PagePlaceholderIcon.Wip} title="Work in progress">
                        This section has not been done yet. Come back later!
                    </PagePlaceholder>
                </Box> */}
            </>
        );
    }
}

function PresetSkeleton() {
    return (
        <Card>
            <CardContent>
                <Box sx={{ mb: 2 }}>
                    <Stack direction="row" gap={4}>
                        <Typography component="span" className="grow" fontWeight="md" level="title-md">
                            <Skeleton animation="wave">Preset name</Skeleton>
                        </Typography>
                        <Skeleton animation="wave" width="48px" height="24px" />
                    </Stack>
                    <Typography level="body-md">
                        <Skeleton animation="wave">Loading preset description... This should take a second.</Skeleton>
                    </Typography>
                </Box>
                <Stack gap={2} direction="row">
                    <Box>
                        <Typography level="title-md" component="div" sx={{ mb: 1 }}>
                            <Skeleton animation="wave">Severity</Skeleton>
                        </Typography>
                        <Skeleton animation="wave" width="132px" height="40px" />
                    </Box>
                    <Box>
                        <Typography level="title-md" component="div" sx={{ mb: 1 }}>
                            <Skeleton animation="wave">Infraction points</Skeleton>
                        </Typography>
                        <Skeleton animation="wave" width="261px" height="40px" />
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}
