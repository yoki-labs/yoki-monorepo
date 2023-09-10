import { useAtom } from "jotai";

import { navbarAtom } from "../../../state/navbar";
import LayoutSidebarTab from "./LayoutSidebarTab";
import { Box, List, Typography } from "@mui/joy";
import { DashboardPageCategory, dashboardPageList } from "../pages";
import { SanitizedServer } from "../../../lib/@types/db";

type Props = {
    menuToggled: boolean;
    serverConfig: SanitizedServer;
    page: string;
};

const categoryNames: Record<DashboardPageCategory, string> = {
    [DashboardPageCategory.Bot]: "Yoki",
    [DashboardPageCategory.Moderation]: "Moderation",
    [DashboardPageCategory.Automod]: "Automod",
    [DashboardPageCategory.Entry]: "Server entry & support",
};

export function LayoutSidebar({ page, serverConfig, menuToggled }: Props) {
    // const [currentPage, setModule] = useAtom(navbarAtom);
    const showStateClass = menuToggled ? "" : " md:block hidden";

    const categorizedPages =
        Object
            .values(DashboardPageCategory)
            .filter((category) => typeof category === "number")
            .map((category) => ({
                category: category as DashboardPageCategory,
                items: dashboardPageList.filter((page) => page.category === category)
            }));

    return (
        <Box sx={{ width: 300, maxWidth: 300, fontSize: 14, px: 4.3, pt: 0, pb: 5 }} className={`h-full overflow-y-auto overflow-x-hidden ${showStateClass}`}>
            { categorizedPages.map(({ category, items }) =>
                <section className="pb-5" key={`sidebar-category-${category}`}>
                    <Typography level="h1" textColor="text.tertiary" fontSize="sm">{categoryNames[category]}</Typography>
                    <List variant="plain">
                        {items.map((item) => (
                            <LayoutSidebarTab key={item.id} serverId={serverConfig.serverId} item={item} isActive={page === item.id} />
                        ))}
                    </List>
                </section>
            )}
        </Box>
    );
}
