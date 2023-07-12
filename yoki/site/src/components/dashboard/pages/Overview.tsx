import { faBan, faEnvelope, faExclamationTriangle, faRadiation, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
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
                        name="Automod"
                        description="Configure how Yoki scans content in your server."
                        icon={faBan}
                        activeClassName="from-red-500 to-pink-500"
                        isActive={false}
                    />
                    <Module
                        name="Antiraid"
                        description="Customize how the bot detects and handles suspicious accounts."
                        icon={faShieldHalved}
                        activeClassName="from-green-500 to-blue-500"
                        isActive={true}
                    />
                    <Module
                        name="Modmail"
                        description="Customize how your users interact with your moderators."
                        icon={faEnvelope}
                        activeClassName="from-purple-500 to-blue-500"
                        isActive={false}
                    />
                </div>
            </section>
        </div>
    );
}
