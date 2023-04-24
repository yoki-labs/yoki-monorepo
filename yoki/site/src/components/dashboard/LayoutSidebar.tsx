import { faArrowDownZA, faBan, faClipboardUser, faCog, faEnvelope, faHashtag, faPrayingHands, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { GuildedServer } from "../../lib/@types/guilded/Server";
import LayoutSidebarTab from "./LayoutSidebarTab";
import { navbarAtom } from "../../state/navbar";
import { useAtom } from "jotai";

type Prop = {
    servers: GuildedServer[];
}

const sidebarItems = [
    { id: "main", name: "Config", icon: faCog },
    { id: "filter", name: "Filtering", icon: faBan },
    { id: "history", name: "Cases", icon: faClipboardUser },
    { id: "logs", name: "Logging", icon: faHashtag },
    { id: "modmail", name: "Modmail", icon: faEnvelope },
    { id: "antiraid", name: "Antiraid", icon: faShieldHalved },
    { id: "antihoist", name: "Antihoist", icon: faArrowDownZA },
    { id: "appeals", name: "Appeals", icon: faPrayingHands },
];

export function LayoutSidebar({ servers }: Prop) {
    const [currentPage, setModule] = useAtom(navbarAtom);

    return (
        <div className="drawer-side h-screen">
            <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
            <ul className="menu p-6 w-72 text-base-content flex flex-col">
                <select className="select select-warning select-lg w-full max-w-xs" defaultValue={"Pick a server"}>
                    <option disabled>Pick a server</option>

                    {servers.map((server) => (
                        <option key={server.name}>{server.name.length > 17 ? `${server.name.slice(0, 17)}...` : server.name}</option>
                    ))}
                </select>

                <ul className="my-4 space-y-2">
                    {sidebarItems.map((item) => (
                        <LayoutSidebarTab item={item} isActive={currentPage === item.id} onClick={() => setModule(item.id)} />
                    ))}
                </ul>
            </ul>
        </div>
    );
}