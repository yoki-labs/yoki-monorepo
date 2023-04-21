import { faCamera, faCog, faDoorClosed, faGavel, faImage, faPray, faRoadSpikes, faVoteYea } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAtom, useAtomValue } from "jotai";

import { GuildedServer } from "../../lib/@types/guilded/Server";
import { navbarAtom } from "../../state/navbar";
import { tempToastAtom } from "../../state/toast";

const sidebar = [
    { name: "Main Settings", icon: faCog },
    { name: "Automod", icon: faGavel },
    { name: "Logging", icon: faCamera },
    { name: "Modmail", icon: faVoteYea },
    { name: "Antiraid", icon: faDoorClosed },
    { name: "Image Scanning", icon: faImage },
    { name: "Antihoist", icon: faRoadSpikes },
    { name: "Appeals", icon: faPray },
];

export default function Layout(props: { servers: GuildedServer[]; children: React.ReactNode }) {
    const [currentModule, setModule] = useAtom(navbarAtom);
    const toast = useAtomValue(tempToastAtom);

    return (
        <>
            <div className="drawer drawer-mobile">
                <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col md:ml-6 my-4">
                    <label htmlFor="my-drawer-2" className="btn bg-primary text-black drawer-button lg:hidden">
                        Open sidebar
                    </label>
                    <div className="h-fit">{props.children}</div>
                </div>
                <div className="drawer-side h-screen">
                    <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
                    <ul className="menu p-4 w-72 bg-gray-900 text-base-content flex flex-col">
                        <select className="select select-warning select-lg w-full max-w-xs" defaultValue={"Pick a server"}>
                            <option disabled>Pick a server</option>

                            {props.servers.map((server) => (
                                <option>{server.name.length > 17 ? `${server.name.slice(0, 17)}...` : server.name}</option>
                            ))}
                        </select>

                        <ul className="my-4 space-y-2">
                            {sidebar.map((item) => (
                                <li
                                    key={item.name}
                                    className={currentModule === item.name ? "bg-custom-gilded text-black rounded-lg" : "rounded-lg"}
                                    onClick={() => setModule(item.name)}
                                >
                                    <div className="flex flex-row">
                                        <FontAwesomeIcon icon={item.icon} className="w-8 mr-2" />
                                        <p className="text-lg">{item.name}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </ul>
                </div>
            </div>
            {toast && (
                <div className="fixed flex items-center w-1/4 max-w-xs p-4 space-x-4 bg-primary text-black rounded-lg shadow top-2 right-5 z-50" role="alert">
                    <div className="text-md font-normal">{toast}</div>
                </div>
            )}
        </>
    );
}
