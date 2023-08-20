import { faAnglesDown, faBan, faEnvelope, faExclamationTriangle, faImage, faImagePortrait, faLink, faPrayingHands, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Module from "../Module";
import { Alert, Typography } from "@mui/joy";

export default function Overview() {
    return (
        <div className="flex flex-col gap-16">
            <Alert variant="solid" color="warning" startDecorator={<FontAwesomeIcon icon={faExclamationTriangle} />}>
                This dashboard is in-progress and may have some bugs. If you run into any issues, report it in{" "}
                <a href="https://www.guilded.gg/yoki" className="font-bold hover:underline">
                    our Guilded server
                </a>
            </Alert>
            <section>
                <Typography level="h3" gutterBottom>
                    Modules
                </Typography>
                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Module
                        name="Modmail"
                        description="Customize how your users interact with your moderators."
                        icon={faEnvelope}
                        activeClassName="from-purple-500 to-blue-500"
                        isActive={true}
                    />
                    <Module
                        name="NSFW Image Scan"
                        description="Removes any potentially NSFW images from chat and media."
                        icon={faImage}
                        activeClassName="from-pink-500 to-purple-500"
                        isActive={true}
                        requiresPremium
                    />
                    <Module
                        name="Anti-raid"
                        description="Customize how the bot detects and handles suspicious accounts."
                        icon={faShieldHalved}
                        activeClassName="from-green-500 to-blue-500"
                        isActive={true}
                    />
                    <Module
                        name="Appeals"
                        description="Allows people to apply for an unban in your server."
                        icon={faPrayingHands}
                        activeClassName="from-violet-500 to-cyan-500"
                        isActive={true}
                    />
                    <Module
                        name="Auto-mod"
                        description="Filters out spam and blacklisted phrases or words."
                        icon={faBan}
                        activeClassName="from-red-500 to-pink-500"
                        isActive={true}
                    />
                    <Module name="Invite Filter" description="Filters out invites in chat." icon={faLink} activeClassName="from-red-500 to-orange-500" isActive={true} />
                    <Module
                        name="Anti-hoist"
                        description="Stops people from putting symbols at the start of their name to put them above everyone else."
                        icon={faAnglesDown}
                        activeClassName="from-green-500 to-yellow-500"
                        isActive={true}
                    />
                </div>
            </section>
        </div>
    );
}
