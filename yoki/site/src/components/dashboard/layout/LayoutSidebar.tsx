import { faBan, faClipboardUser, faCog, faEnvelope, faHashtag, faLayerGroup, faPrayingHands, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { useAtom } from "jotai";

import { navbarAtom } from "../../../state/navbar";
import LayoutSidebarTab from "./LayoutSidebarTab";
import { Box, List } from "@mui/joy";
import { dashboardPageList } from "../pages";

type Props = {
    menuToggled: boolean;
};

export function LayoutSidebar({ menuToggled }: Props) {
    const [currentPage, setModule] = useAtom(navbarAtom);
    const showStateClass = menuToggled ? "" : " md:block hidden";

    return (
        <Box sx={{ px: 4.3, py: 0 }} className={`h-full overflow-y-auto overflow-x-hidden ${showStateClass}`}>
            <List className="w-64" variant="plain" size="sm" sx={{ maxWidth: 320, fontSize: 14 }}>
                {dashboardPageList.map((item) => (
                    <LayoutSidebarTab key={item.id} item={item} isActive={currentPage === item.id} onClick={() => setModule(item.id)} />
                ))}
            </List>
        </Box>
    );
}
