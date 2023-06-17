import { faBan, faEnvelope, faRadiation, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Module from "../Module";
import { Box } from "@mui/material";

export default function Home() {
    return (
        <div className="flex flex-col gap-16">
            <Box className="bg-yellow-500">
                <FontAwesomeIcon className="stroke-current shrink-0 h-6 w-6" icon={faRadiation} />
                <div>
                    <p>
                        This dashboard is in-progress and may have some bugs. If you run into any issues, report it in{" "}
                        <a href="https://www.guilded.gg/yoki" className="font-bold hover:underline">
                            our Guilded server
                        </a>
                    </p>
                </div>
            </Box>

            <div>
                <h2 className="text-3xl font-medium mb-4">Modules</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <Module name="Automod" description="Configure how Yoki scans content in your server." icon={faBan} activeClassName="from-red-500 to-pink-500" isActive={false} />
                    <Module name="Antiraid" description="Customize how the bot detects and handles suspicious accounts." icon={faShieldHalved} activeClassName="from-green-500 to-blue-500" isActive={true} />
                    <Module name="Modmail" description="Customize how your users interact with your moderators." icon={faEnvelope} activeClassName="from-purple-500 to-blue-500" isActive={false} />
                </div>
            </div>
        </div>
    );
}
