import { faAnglesDown, faBan, faEnvelope, faExclamationTriangle, faHeart, faImage, faLink, faPrayingHands, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert, Box, Typography } from "@mui/joy";

import LabsIconCard from "../../LabsIconCard";
import DashboardModule from "../DashboardModule";
import { DashboardPageProps } from "./page";

export default function OverviewPage(props: DashboardPageProps) {
    const { serverConfig } = props;

    return (
        <div className="flex flex-col gap-16">
            <Alert variant="solid" color="warning" startDecorator={<FontAwesomeIcon icon={faExclamationTriangle} />}>
                <Box sx={{ alignItems: "baseline" }}>
                    This dashboard is in-progress and may have some bugs. If you run into any issues, report it in{" "}
                    <a href="https://www.guilded.gg/yoki" className="font-bold hover:underline">
                        our Guilded server
                    </a>
                </Box>
            </Alert>
            {/* Maybe do vertical icon cards with 4 tiers in premium tab? */}
            <LabsIconCard icon={faHeart} iconAspectRatio={0.8}>
                <Typography level="body1" fontWeight="md">
                    Free
                </Typography>
                <Typography level="body2">Yoki is currently in free tier.</Typography>
            </LabsIconCard>
            <section>
                <Typography level="h3" gutterBottom>
                    Modules
                </Typography>
                <div className="grid sm:grid-cols-1 md:grid-cols-2 xlg:grid-cols-3 gap-5">
                    <DashboardModule
                        name="Modmail"
                        description="Customize how your users interact with your moderators."
                        icon={faEnvelope}
                        activeClassName="from-purple-500 to-blue-500"
                        isActive={serverConfig.modmailEnabled}
                        onToggle={(value) => console.log("Modmail toggle", value)}
                    />
                    <DashboardModule
                        name="NSFW Image Scan"
                        description="Removes any potentially NSFW images from chat and media."
                        icon={faImage}
                        activeClassName="from-pink-500 to-purple-500"
                        isActive={serverConfig.scanNSFW}
                        requiresPremium
                        onToggle={(value) => console.log("NSFW Image Scan toggle", value)}
                    />
                    <DashboardModule
                        name="Anti-raid"
                        description="Customize how the bot detects and handles suspicious accounts."
                        icon={faShieldHalved}
                        activeClassName="from-green-500 to-blue-500"
                        isActive={serverConfig.antiRaidEnabled}
                        onToggle={(value) => console.log("Anti-raid toggle", value)}
                    />
                    <DashboardModule
                        name="Appeals"
                        description="Allows people to apply for an unban in your server."
                        icon={faPrayingHands}
                        activeClassName="from-violet-500 to-cyan-500"
                        isActive={serverConfig.appealsEnabled}
                        onToggle={(value) => console.log("Appeals toggle", value)}
                    />
                    <DashboardModule
                        name="Auto-mod"
                        description="Filters out spam and blacklisted phrases or links."
                        icon={faBan}
                        activeClassName="from-red-500 to-pink-500"
                        isActive={serverConfig.filterEnabled}
                        onToggle={(value) => console.log("Auto-mod toggle", value)}
                    />
                    <DashboardModule
                        name="Invite Filter"
                        description="Filters out invites in chat."
                        icon={faLink}
                        activeClassName="from-red-500 to-orange-500"
                        isActive={serverConfig.filterInvites}
                        onToggle={(value) => console.log("Invite Filter toggle", value)}
                    />
                    <DashboardModule
                        name="Anti-hoist"
                        description="Stops people from putting symbols at the start of their name to put them above everyone else."
                        icon={faAnglesDown}
                        activeClassName="from-green-500 to-yellow-500"
                        isActive={serverConfig.antiHoistEnabled}
                        onToggle={(value) => console.log("Anti-hoist toggle", value)}
                    />
                </div>
            </section>
        </div>
    );
}
