import { faAnglesDown, faBan, faEnvelope, faImage, faLink, faPrayingHands, faShieldHalved } from "@fortawesome/free-solid-svg-icons";

import DashboardModule from "../DashboardModule";
import { Box, Stack, Typography } from "@mui/joy";
import { DashboardPageProps } from "../pages";
import DashboardProfileCard from "./ProfileCard";
import { PremiumType, RoleType } from "@prisma/client";
import { WavingHandRounded } from "@mui/icons-material";

export default function OverviewPage(props: DashboardPageProps) {
    const { serverConfig, highestRoleType } = props;

    return (
        <Stack direction="column" gap={4}>
            {/* Maybe do vertical icon cards with 4 tiers in premium tab? */}
            <DashboardProfileCard serverConfig={serverConfig} highestRoleType={highestRoleType} />
            <section>
                <Typography level="title-lg" gutterBottom>
                    Modules
                </Typography>
                <Box className="grid grid-cols-1 lg:grid-cols-2 xlg:grid-cols-3 gap-5">
                    <DashboardModule
                        name="Modmail"
                        description="Customize how your users interact with your moderators."
                        icon={faEnvelope}
                        activeClassName="from-purple-500 to-blue-500"
                        serverConfig={serverConfig}
                        disabled={highestRoleType !== RoleType.ADMIN}
                        prop="modmailEnabled"
                    />
                    <DashboardModule
                        name="NSFW Image Scan"
                        description="Removes any potentially NSFW images from chat and media."
                        icon={faImage}
                        activeClassName="from-pink-500 to-purple-500"
                        serverConfig={serverConfig}
                        prop="scanNSFW"
                        requiresPremium={PremiumType.Silver}
                        disabled={!serverConfig.premium || highestRoleType !== RoleType.ADMIN}
                    />
                    <DashboardModule
                        name="Anti-raid"
                        description="Customize how the bot detects and handles suspicious accounts."
                        icon={faShieldHalved}
                        activeClassName="from-green-500 to-cyan-500"
                        serverConfig={serverConfig}
                        disabled={highestRoleType !== RoleType.ADMIN}
                        prop="antiRaidEnabled"
                    />
                    <DashboardModule
                        name="Welcome"
                        description="Greets new verified users."
                        iconComponent={WavingHandRounded}
                        activeClassName="from-indigo-500 to-fuchsia-500"
                        serverConfig={serverConfig}
                        requiresEarlyAccess
                        disabled={!serverConfig.earlyaccess}
                        prop="welcomeEnabled"
                    />
                    {/* <DashboardModule
                        name="Anti-nuke"
                        description="Customize how rogue mods are handled."
                        icon={faUserSecret}
                        activeClassName="from-pink-500 to-violet-500"
                        serverConfig={serverConfig}
                        disabled={highestRoleType !== RoleType.ADMIN}
                        requiresEarlyAccess
                        prop="antiRaidEnabled"
                        /> */}
                    <DashboardModule
                        name="Appeals"
                        description="Allows people to apply for an unban in your server."
                        icon={faPrayingHands}
                        activeClassName="from-blue-500 to-teal-500"
                        serverConfig={serverConfig}
                        disabled={highestRoleType !== RoleType.ADMIN}
                        prop="appealsEnabled"
                    />
                    <DashboardModule
                        name="Filter"
                        description="Filters out spam and blacklisted phrases or links."
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
            </section>
        </Stack>
    );
}
