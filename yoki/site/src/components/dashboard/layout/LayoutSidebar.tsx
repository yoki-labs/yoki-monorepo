import { faArrowDownZA, faBan, faClipboardUser, faCog, faEnvelope, faHashtag, faHome, faPrayingHands, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { useAtom } from "jotai";

import { navbarAtom } from "../../../state/navbar";
import LayoutSidebarTab from "./LayoutSidebarTab";
import { List } from "@mui/joy";

const sidebarItems = [
    { id: "home", name: "Home", icon: faHome },
    { id: "main", name: "Config", icon: faCog },
    { id: "automod", name: "Automod", icon: faBan },
    { id: "history", name: "Cases", icon: faClipboardUser },
    { id: "logs", name: "Logging", icon: faHashtag },
    { id: "modmail", name: "Modmail", icon: faEnvelope },
    { id: "antiraid", name: "Antiraid", icon: faShieldHalved },
    { id: "antihoist", name: "Antihoist", icon: faArrowDownZA },
    { id: "appeals", name: "Appeals", icon: faPrayingHands },
];

export function LayoutSidebar() {
    const [currentPage, setModule] = useAtom(navbarAtom);

    return (
        <div className="drawer-side">
            <ul className="menu p-6 w-72 text-base-content flex flex-col">
                <List variant="plain" size="sm" sx={{ maxWidth: 320, fontSize: 14 }}>
                    {sidebarItems.map((item) => (
                        <LayoutSidebarTab key={item.id} item={item} isActive={currentPage === item.id} onClick={() => setModule(item.id)} />
                    ))}
                </List>
            </ul>
        </div>
    );
}
