import { faArrowDownZA, faBan, faClipboardUser, faCog, faEnvelope, faHashtag, faHome, faPrayingHands, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { useAtom } from "jotai";

import { GuildedServer } from "../../../lib/@types/guilded/Server";
import { navbarAtom } from "../../../state/navbar";
import LayoutSidebarTab from "./LayoutSidebarTab";
import { FormControl, InputLabel, List, MenuItem, Select } from "@mui/material";

interface Prop {
    servers: GuildedServer[];
}

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

export function LayoutSidebar({ servers }: Prop) {
    const [currentPage, setModule] = useAtom(navbarAtom);

    return (
        <div className="drawer-side h-screen">
            <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
            <ul className="menu p-6 w-72 text-base-content flex flex-col">
                <FormControl variant="filled">
                    <InputLabel id="server-picker-label">Server</InputLabel>
                    <Select id="server-picker" labelId="server-picker-label" label="Server">
                        {servers.map((server) => (
                            <MenuItem value={server.id}>{server.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <List component="nav">
                    {sidebarItems.map((item) => (
                        <LayoutSidebarTab key={item.id} item={item} isActive={currentPage === item.id} onClick={() => setModule(item.id)} />
                    ))}
                </List>
            </ul>
        </div>
    );
}
