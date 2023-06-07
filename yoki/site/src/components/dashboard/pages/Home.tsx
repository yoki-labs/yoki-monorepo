import { faBan, faEnvelope, faRadiation, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Module from "../Module";

export default function Home() {
    return (
        <div className="flex flex-col gap-16">
            <div className="alert alert-warning justify-start">
                <FontAwesomeIcon className="stroke-current shrink-0 h-6 w-6" icon={faRadiation} />
                <div>
                    <p>
                        This dashboard is in-progress and may have some bugs. If you run into any issues, report it in{" "}
                        <a href="https://www.guilded.gg/yoki" className="font-bold hover:underline">
                            our Guilded server
                        </a>
                    </p>
                </div>
            </div>

            <div>
                <h2 className="text-3xl font-medium mb-4">Modules</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <Module name="Automod" description="Configure how Yoki scans content in your server." icon={faBan} color="bg-red-500" />
                    <Module name="Antiraid" description="Customize how the bot detects and handles suspicious accounts." icon={faShieldHalved} color="bg-green-600" />
                    <Module name="Modmail" description="Customize how your users interact with your moderators." icon={faEnvelope} color="bg-purple-500" />
                </div>
            </div>
        </div>
    );
}
