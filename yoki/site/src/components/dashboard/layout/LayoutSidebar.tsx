import { faArrowDownZA, faBan, faClipboardUser, faCog, faEnvelope, faHashtag, faHome, faLayerGroup, faPrayingHands, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { useAtom } from "jotai";

import { navbarAtom } from "../../../state/navbar";
import LayoutSidebarTab from "./LayoutSidebarTab";
import { Box, List } from "@mui/joy";

const sidebarItems = [
    { id: "overview", name: "Overview", icon: faLayerGroup },
    { id: "main", name: "Config", icon: faCog },
    { id: "automod", name: "Automod", icon: faBan },
    { id: "history", name: "Cases", icon: faClipboardUser },
    { id: "logs", name: "Logging", icon: faHashtag },
    { id: "modmail", name: "Modmail", icon: faEnvelope },
    { id: "antiraid", name: "Antiraid", icon: faShieldHalved },
    { id: "antihoist", name: "Antihoist", icon: faArrowDownZA },
    { id: "appeals", name: "Appeals", icon: faPrayingHands },
];

type Props = {
    menuToggled: boolean;
};

export function LayoutSidebar({ menuToggled }: Props) {
    const [currentPage, setModule] = useAtom(navbarAtom);
    const showStateClass = menuToggled ? "" : "md:block hidden";

    return (
        <Box className={showStateClass}>
            <ul className="menu p-6 w-64 text-base-content flex flex-col">
                <List variant="plain" size="sm" sx={{ maxWidth: 320, fontSize: 14 }}>
                    {sidebarItems.map((item) => (
                        <LayoutSidebarTab key={item.id} item={item} isActive={currentPage === item.id} onClick={() => setModule(item.id)} />
                    ))}
                </List>
            </ul>
        </Box>
    );
}
