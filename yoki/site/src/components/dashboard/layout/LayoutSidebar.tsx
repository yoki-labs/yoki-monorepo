import { useAtom } from "jotai";

import { navbarAtom } from "../../../state/navbar";
import LayoutSidebarTab from "./LayoutSidebarTab";
import { Box, List, Typography } from "@mui/joy";
import { DashboardPageCategory, dashboardPageList } from "../pages";
import { SanitizedServer } from "../../../lib/@types/db";
import { ServerSelector } from "./ServerSelector";
import { GuildedServer } from "../../../lib/@types/guilded";

type Props = {
    menuToggled: boolean;
    serverConfig: SanitizedServer;
    servers: GuildedServer[];
    currentServer: GuildedServer | undefined;
    page: string;
    onServerChange: (serverId: string) => void;
};

const categoryNames: Record<DashboardPageCategory, string> = {
    [DashboardPageCategory.Bot]: "Yoki",
    [DashboardPageCategory.Moderation]: "Moderation",
    [DashboardPageCategory.Automod]: "Automod",
    [DashboardPageCategory.Entry]: "Server entry & support",
};

export function LayoutSidebar({ page, serverConfig, menuToggled, currentServer, servers, onServerChange }: Props) {
    // const [currentPage, setModule] = useAtom(navbarAtom);
    const showStateClass = menuToggled ? "" : " md:block hidden";

    const categorizedPages = Object.values(DashboardPageCategory)
        .filter((category) => typeof category === "number")
        .map((category) => ({
            category: category as DashboardPageCategory,
            items: dashboardPageList.filter((page) => page.category === category),
        }));

    return (
        <Box sx={{ fontSize: 14, pb: 5 }} className={`px-5 w-full pt-4 md:pt-0 md:px-7 md:max-w-80 md:w-80 h-full overflow-y-auto overflow-x-hidden ${showStateClass}`}>
            <Box sx={{ mb: 5 }} className="block md:hidden">
                <ServerSelector onChange={onServerChange} defaultValue={currentServer} servers={servers} />
            </Box>
            {categorizedPages.map(({ category, items }) => (
                <section className="pb-5" key={`sidebar-category-${category}`}>
                    <Typography level="h1" textColor="text.tertiary" fontSize="sm">
                        {categoryNames[category]}
                    </Typography>
                    <List variant="plain">
                        {items.map((item) => (
                            <LayoutSidebarTab key={item.id} serverId={serverConfig.serverId} item={item} isActive={page === item.id} />
                        ))}
                    </List>
                </section>
            ))}
        </Box>
    );
}
